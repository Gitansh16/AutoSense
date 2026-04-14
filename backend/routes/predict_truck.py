"""
routes/predict_truck.py
"""

import os
import sys
import pickle
import logging
from typing import List

import numpy as np
import torch
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scania_model import BiLSTMAttention
from utils.jwt import decode_access_token

logger = logging.getLogger(__name__)

router   = APIRouter(prefix="/predict", tags=["truck-prediction"])
security = HTTPBearer()

# ── Constants ─────────────────────────────────────────────────────────────────
SEQUENCE_LENGTH = 50
N_FEATURES      = 105
N_CLASSES       = 5

CLASS_LABELS = {
    0: "Healthy (>48 h)",
    1: "Warning  (48–24 h)",
    2: "Alert    (24–12 h)",
    3: "Critical (12–6 h)",
    4: "Imminent (<6 h)",
}

CLASS_SHORT = {
    0: "Healthy",
    1: "Warning",
    2: "Alert",
    3: "Critical",
    4: "Imminent",
}

# ── Resolve absolute paths ────────────────────────────────────────────────────
_BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR     = os.path.join(_BASE_DIR, "Truck_Models")
MODEL_PATH    = os.path.join(MODEL_DIR, "best_hybrid_lambda_009.pt")
FALLBACK_PATH = os.path.join(MODEL_DIR, "best_temporal_model.pt")
SCALER_PATH   = os.path.join(MODEL_DIR, "scaler_truck.pkl")
FEAT_COL_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")

# ── Lazy globals ──────────────────────────────────────────────────────────────
_scaler          = None
_feature_columns = None
_model           = None
_device          = None
_model_path_used = None
_load_error      = None


def _load_truck_artifacts():
    global _scaler, _feature_columns, _model, _device, _model_path_used, _load_error

    if _model is not None:
        return  # already loaded

    try:
        logger.info(f"[Truck] Looking for artifacts in: {MODEL_DIR}")

        if not os.path.exists(SCALER_PATH):
            raise RuntimeError(f"Truck scaler not found at: {SCALER_PATH}")
        with open(SCALER_PATH, "rb") as f:
            _scaler = pickle.load(f)
        logger.info("Truck scaler loaded.")

        if not os.path.exists(FEAT_COL_PATH):
            raise RuntimeError(f"Feature columns not found at: {FEAT_COL_PATH}")
        with open(FEAT_COL_PATH, "rb") as f:
            _feature_columns = pickle.load(f)
        logger.info(f"Feature columns loaded: {len(_feature_columns)} features.")

        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        path = MODEL_PATH if os.path.exists(MODEL_PATH) else FALLBACK_PATH
        if not os.path.exists(path):
            raise RuntimeError(
                f"No .pt model found. Checked:\n  {MODEL_PATH}\n  {FALLBACK_PATH}"
            )

        _model = BiLSTMAttention(input_size=len(_feature_columns)).to(_device)
        _model.load_state_dict(torch.load(path, map_location=_device))
        _model.eval()
        _model_path_used = os.path.basename(path)
        _load_error = None
        logger.info(f"Truck model loaded: {path} on {_device}")

    except Exception as e:
        _scaler = None
        _feature_columns = None
        _model = None
        _device = None
        _model_path_used = None
        _load_error = str(e)
        raise


def warmup_truck_models() -> dict:
    try:
        _load_truck_artifacts()
        return {
            "loaded": True,
            "error": None,
            "model": f"BiLSTMAttention ({_model_path_used})",
            "n_features": len(_feature_columns) if _feature_columns else N_FEATURES,
            "sequence_length": SEQUENCE_LENGTH,
        }
    except Exception:
        return {
            "loaded": False,
            "error": _load_error,
            "model": None,
            "n_features": N_FEATURES,
            "sequence_length": SEQUENCE_LENGTH,
        }


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class TruckPredictRequest(BaseModel):
    features:   List[float]
    vehicle_id: str = "unknown"


class TruckPredictResponse(BaseModel):
    vehicle_id:      str
    predicted_class: int
    risk_label:      str
    risk_short:      str
    confidence_pct:  float
    probabilities:   List[float]
    model:           str
    sequence_length: int
    n_features:      int


# ── Auth helper ───────────────────────────────────────────────────────────────

def _get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/truck", response_model=TruckPredictResponse)
async def predict_truck(
    request: TruckPredictRequest,
    _user=Depends(_get_current_user),
):
    # 1. Load artifacts — return clean 500 if files are missing
    try:
        _load_truck_artifacts()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Model loading failed: {_load_error or str(e)}",
        )

    # 2. Inference
    try:
        features = np.array(request.features, dtype=np.float32)
        expected_features = len(_feature_columns) if _feature_columns else N_FEATURES
        expected_sequence_features = SEQUENCE_LENGTH * expected_features

        if features.shape[0] == expected_features:
            # Deterministic sequence construction for stable repeated predictions.
            seq = np.tile(features, (SEQUENCE_LENGTH, 1))
        elif features.shape[0] == expected_sequence_features:
            seq = features.reshape(SEQUENCE_LENGTH, expected_features)
        else:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Expected {expected_features} or {expected_sequence_features} "
                    f"features, got {features.shape[0]}."
                ),
            )

        N, F     = seq.shape
        X_scaled = _scaler.transform(seq.reshape(-1, F)).reshape(N, F)
        X_tensor = torch.tensor(X_scaled).unsqueeze(0).to(_device)

        with torch.no_grad():
            logits = _model(X_tensor)
            probs  = torch.nn.functional.softmax(logits, dim=1).cpu().numpy()[0]

        predicted_class = int(probs.argmax())
        confidence      = float(probs.max()) * 100

        return TruckPredictResponse(
            vehicle_id      = request.vehicle_id,
            predicted_class = predicted_class,
            risk_label      = CLASS_LABELS[predicted_class],
            risk_short      = CLASS_SHORT[predicted_class],
            confidence_pct  = round(confidence, 2),
            probabilities   = [round(float(p) * 100, 2) for p in probs],
            model           = f"BiLSTMAttention ({_model_path_used})",
            sequence_length = SEQUENCE_LENGTH,
            n_features      = N_FEATURES,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Truck inference error")
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")


@router.get("/truck/status")
async def truck_model_status(_user=Depends(_get_current_user)):
    status = warmup_truck_models()
    if status["loaded"]:
        return {
            "status":          "ready",
            "model":           status["model"],
            "device":          str(_device),
            "n_features":      status["n_features"],
            "sequence_length": status["sequence_length"],
            "n_classes":       N_CLASSES,
            "class_labels":    CLASS_LABELS,
        }
    return {
        "status": "error",
        "detail": status["error"],
    }