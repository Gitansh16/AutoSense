# backend/routes/predict.py

import pickle
import joblib
import numpy as np
import pandas as pd                # ← fixes "X does not have valid feature names" warning
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from utils.jwt import decode_access_token

router   = APIRouter()
security = HTTPBearer()

BASE = Path(__file__).parent.parent / "models"

# ── Load models at startup ────────────────────────────────────────────────────
_load_error = None
scaler = None
classifier = None
regressor = None
config = None
FEATURE_NAMES = []
RUL_THRESHOLD = 56.1


def _load_ev_artifacts(force: bool = False) -> bool:
    global _load_error, scaler, classifier, regressor, config, FEATURE_NAMES, RUL_THRESHOLD

    if regressor is not None and not force:
        return True

    try:
        scaler = joblib.load(BASE / "scaler.pkl")
        classifier = joblib.load(BASE / "best_classifier.pkl")
        regressor = joblib.load(BASE / "best_regressor.pkl")

        with open(BASE / "config.pkl", "rb") as f:
            config = pickle.load(f)

        FEATURE_NAMES = list(config["feature_names"])
        RUL_THRESHOLD = float(config.get("rul_threshold", 56.1))
        _load_error = None
        print(f"[EV] Models loaded ✓  features={len(FEATURE_NAMES)}  threshold={RUL_THRESHOLD:.1f}d")
        return True

    except FileNotFoundError as e:
        _load_error = f"Model file not found: {e}. Place pkl files in backend/models/."
    except Exception as e:
        _load_error = f"Failed to load EV model artifacts: {e}"

    scaler = None
    classifier = None
    regressor = None
    config = None
    FEATURE_NAMES = []
    RUL_THRESHOLD = 56.1
    print(f"[EV] ERROR — {_load_error}")
    return False


def warmup_ev_models() -> dict:
    loaded = _load_ev_artifacts(force=True)
    return {
        "loaded": loaded,
        "error": _load_error,
        "feature_count": len(FEATURE_NAMES),
        "rul_threshold": RUL_THRESHOLD,
    }


_load_ev_artifacts()


# ── Request schema (42 features, exact order from config.pkl) ─────────────────
class EVPredictRequest(BaseModel):
    # Raw sensors (24)
    SoC: float;  SoH: float;  Battery_Voltage: float;  Battery_Current: float
    Battery_Temperature: float;  Charge_Cycles: float
    Motor_Temperature: float;  Motor_Vibration: float
    Motor_Torque: float;  Motor_RPM: float;  Power_Consumption: float
    Brake_Pad_Wear: float;  Brake_Pressure: float;  Reg_Brake_Efficiency: float
    Tire_Pressure: float;  Tire_Temperature: float;  Suspension_Load: float
    Ambient_Temperature: float;  Ambient_Humidity: float;  Load_Weight: float
    Driving_Speed: float;  Distance_Traveled: float
    Idle_Time: float;  Route_Roughness: float
    # Derived (9)
    Battery_Power: float;  SoC_Level: float;  Motor_Power: float
    Motor_Load_Factor: float;  Energy_Efficiency: float;  Speed_Power_Ratio: float
    Weather_Index: float;  Idle_Ratio: float;  Load_Efficiency: float
    # Rolling stats (9)
    SoC_roll_mean: float;  SoC_roll_std: float;  SoC_delta: float
    Power_Consumption_roll_mean: float;  Power_Consumption_roll_std: float
    Power_Consumption_delta: float
    Driving_Speed_roll_mean: float;  Driving_Speed_roll_std: float
    Driving_Speed_delta: float


# ── Helpers ───────────────────────────────────────────────────────────────────
def risk_label(rul: float) -> str:
    if rul >= 80:  return "Healthy"
    if rul >= 56:  return "Monitor"
    if rul >= 30:  return "Need Service"
    return "Critical"


def _get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = decode_access_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


# ── POST /predict/ev ──────────────────────────────────────────────────────────
@router.post("/predict/ev")
async def predict_ev(
    payload: EVPredictRequest,
    _user=Depends(_get_current_user),
):
    if regressor is None and not _load_ev_artifacts(force=True):
        raise HTTPException(status_code=503, detail=_load_error or "Models not loaded.")

    # Build DataFrame with named columns — silences LightGBM/sklearn warnings
    data = payload.model_dump()
    missing_features = [f for f in FEATURE_NAMES if f not in data]
    if missing_features:
        raise HTTPException(status_code=422, detail=f"Missing features: {missing_features}")
    X_df = pd.DataFrame([{name: data[name] for name in FEATURE_NAMES}], columns=FEATURE_NAMES)

    # Scale using the same named DataFrame
    X_scaled = pd.DataFrame(
        scaler.transform(X_df),
        columns=FEATURE_NAMES
    )

    rul      = float(max(0.0, round(regressor.predict(X_scaled)[0], 1)))
    risk_cls = int(classifier.predict(X_scaled)[0])

    try:
        proba      = classifier.predict_proba(X_scaled)[0]
        confidence = round(float(max(proba)) * 100, 1)
    except Exception:
        confidence = None

    return {
        "rul_days":         rul,
        "risk_label":       risk_label(rul),
        "risk_class":       risk_cls,
        "risk_class_label": "At Risk" if risk_cls == 0 else "Healthy",
        "confidence_pct":   confidence,
        "rul_threshold":    RUL_THRESHOLD,
        "reg_r2":           round((config or {}).get("reg_r2", 0), 4),
        "clf_auc":          round((config or {}).get("clf_auc", 0), 4),
        "model":            (config or {}).get("best_reg_model", "Stacking Ensemble"),
    }


# ── GET /predict/ev/status ────────────────────────────────────────────────────
@router.get("/predict/ev/status")
async def ev_model_status():
    if regressor is None:
        _load_ev_artifacts(force=True)

    return {
        "loaded":        regressor is not None,
        "error":         _load_error,
        "feature_count": len(FEATURE_NAMES),
        "rul_threshold": RUL_THRESHOLD,
    }