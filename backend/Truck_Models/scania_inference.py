"""
scania_inference.py
────────────────────────────────────────────────────────────────────────────────
Full inference pipeline for Scania truck failure prediction.

Usage (command line):
    python scania_inference.py --input path/to/operational_readouts.csv

Usage (Python):
    from scania_inference import predict
    results = predict("path/to/operational_readouts.csv")
    print(results)

Required files (all in the same folder as this script):
    best_hybrid_lambda_009.pt   ← primary model  (best industrial cost)
    best_temporal_model.pt      ← backup  model  (slightly higher cost)
    scaler.pkl                  ← StandardScaler fitted on training data
    feature_columns.pkl         ← ordered list of 105 feature column names
    scania_model.py             ← BiLSTMAttention class definition

Output columns:
    vehicle_id   – vehicle identifier from the CSV
    predicted_class – 0 / 1 / 2 / 3 / 4
    risk_label   – human-readable label
    confidence   – softmax probability of the predicted class (0–1)
────────────────────────────────────────────────────────────────────────────────
"""

import os
import sys
import pickle
import argparse

import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F

from scania_model import BiLSTMAttention


# ── Constants ─────────────────────────────────────────────────────────────────

SEQUENCE_LENGTH = 50

CLASS_LABELS = {
    0: "Healthy (>48 h)",
    1: "Warning  (48–24 h)",
    2: "Alert    (24–12 h)",
    3: "Critical (12–6 h)",
    4: "Imminent (<6 h)",
}

DEFAULT_MODEL   = "best_hybrid_lambda_009.pt"
FALLBACK_MODEL  = "best_temporal_model.pt"
SCALER_PATH     = "scaler.pkl"
FEATURE_COL_PATH = "feature_columns.pkl"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_artifacts(model_path: str):
    """Load scaler, feature columns, and model weights."""

    # -- Scaler
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Scaler not found: {SCALER_PATH}")
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)

    # -- Feature columns
    if not os.path.exists(FEATURE_COL_PATH):
        raise FileNotFoundError(f"Feature columns file not found: {FEATURE_COL_PATH}")
    with open(FEATURE_COL_PATH, "rb") as f:
        feature_columns = pickle.load(f)

    # -- Model
    if not os.path.exists(model_path):
        print(f"[WARNING] Model not found at '{model_path}'. Trying fallback: {FALLBACK_MODEL}")
        model_path = FALLBACK_MODEL
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No model file found. Expected '{DEFAULT_MODEL}' or '{FALLBACK_MODEL}'.")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = BiLSTMAttention(input_size=len(feature_columns)).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    print(f"[INFO] Model loaded from  : {model_path}")
    print(f"[INFO] Running on device  : {device}")
    print(f"[INFO] Number of features : {len(feature_columns)}")

    return scaler, feature_columns, model, device


def _preprocess(df: pd.DataFrame, feature_columns: list, scaler) -> dict:
    """
    Clean, impute, sort, and build padded sequences from a raw operational CSV.

    Returns a dict: { vehicle_id -> np.ndarray of shape (SEQUENCE_LENGTH, n_features) }
    """

    # Sort chronologically
    df = df.sort_values(["vehicle_id", "time_step"])

    # Forward-fill within each vehicle to handle NaNs
    df = (
        df.groupby("vehicle_id", as_index=False)
          .apply(lambda g: g.ffill(), include_groups=False)
          .reset_index(drop=True)
    )

    # Fill any remaining NaNs with column median
    df = df.fillna(df.median(numeric_only=True))

    # Keep only the 105 expected features; add zero-columns for anything missing
    missing_cols = [c for c in feature_columns if c not in df.columns]
    if missing_cols:
        print(f"[WARNING] {len(missing_cols)} feature column(s) not found in CSV — filled with 0.")
        for c in missing_cols:
            df[c] = 0.0

    sequences = {}
    for vehicle_id, group in df.groupby("vehicle_id"):
        features = group[feature_columns].values.astype(np.float32)  # (T, 105)

        if len(features) >= SEQUENCE_LENGTH:
            seq = features[-SEQUENCE_LENGTH:]          # take the most recent 50 steps
        else:
            pad = np.zeros((SEQUENCE_LENGTH - len(features), features.shape[1]), dtype=np.float32)
            seq = np.vstack([pad, features])           # zero-pad at the front

        sequences[vehicle_id] = seq

    # Scale: flatten → transform → reshape
    vehicle_ids = list(sequences.keys())
    X = np.stack([sequences[v] for v in vehicle_ids])     # (N, 50, 105)
    N, T, F = X.shape
    X_scaled = scaler.transform(X.reshape(-1, F)).reshape(N, T, F)

    return {v: X_scaled[i] for i, v in enumerate(vehicle_ids)}


# ── Public API ────────────────────────────────────────────────────────────────

def predict(
    csv_path: str,
    model_path: str = DEFAULT_MODEL,
    batch_size: int = 64,
) -> pd.DataFrame:
    """
    Run inference on a CSV of operational readouts.

    Parameters
    ----------
    csv_path   : path to the operational readouts CSV
                 (must have 'vehicle_id', 'time_step', and the 105 feature columns)
    model_path : which .pt file to use (default: best_hybrid_lambda_009.pt)
    batch_size : inference batch size (default: 64)

    Returns
    -------
    pd.DataFrame with columns:
        vehicle_id, predicted_class, risk_label, confidence
    """

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Input CSV not found: {csv_path}")

    print(f"[INFO] Reading CSV: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[INFO] Rows: {len(df):,}  |  Unique vehicles: {df['vehicle_id'].nunique():,}")

    scaler, feature_columns, model, device = _load_artifacts(model_path)
    sequences = _preprocess(df, feature_columns, scaler)

    vehicle_ids = list(sequences.keys())
    X = np.stack([sequences[v] for v in vehicle_ids]).astype(np.float32)
    X_tensor = torch.tensor(X)

    all_probs = []
    model.eval()
    with torch.no_grad():
        for start in range(0, len(X_tensor), batch_size):
            batch = X_tensor[start : start + batch_size].to(device)
            logits = model(batch)
            probs  = F.softmax(logits, dim=1).cpu().numpy()
            all_probs.append(probs)

    all_probs = np.vstack(all_probs)                        # (N, 5)
    predicted_classes = all_probs.argmax(axis=1)
    confidences       = all_probs.max(axis=1)

    results = pd.DataFrame({
        "vehicle_id"      : vehicle_ids,
        "predicted_class" : predicted_classes,
        "risk_label"      : [CLASS_LABELS[c] for c in predicted_classes],
        "confidence"      : confidences.round(4),
    })

    print("\n[INFO] Prediction summary:")
    print(results["risk_label"].value_counts().to_string())
    return results


# ── CLI entry point ───────────────────────────────────────────────────────────

def _parse_args():
    parser = argparse.ArgumentParser(
        description="Scania Truck Failure Prediction — Inference Pipeline"
    )
    parser.add_argument(
        "--input", required=True,
        help="Path to the operational readouts CSV file"
    )
    parser.add_argument(
        "--model", default=DEFAULT_MODEL,
        help=f"Model .pt file to use (default: {DEFAULT_MODEL})"
    )
    parser.add_argument(
        "--output", default=None,
        help="Optional: save predictions to this CSV path"
    )
    parser.add_argument(
        "--batch_size", type=int, default=64,
        help="Inference batch size (default: 64)"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    predictions = predict(
        csv_path   = args.input,
        model_path = args.model,
        batch_size = args.batch_size,
    )

    print("\n[INFO] First 10 predictions:")
    print(predictions.head(10).to_string(index=False))

    if args.output:
        predictions.to_csv(args.output, index=False)
        print(f"\n[INFO] Predictions saved to: {args.output}")
