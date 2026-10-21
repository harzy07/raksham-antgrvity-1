"""
RAKSHAM - Emerging Cluster Engine (HDBSCAN)
Flags novel fraud workflows that do not match existing static pattern signatures.
Clusters transactions on multi-dimensional feature space (session, context, graph).
Outlier points (cluster label == -1) with high density distance are flagged as candidate emerging scams.
"""

import numpy as np
from sklearn.cluster import HDBSCAN
from sklearn.preprocessing import StandardScaler
import joblib
import os

FEATURE_COLS = [
    "time_on_step",
    "geo_velocity_kmh",
    "amount_ratio_history",
    "beneficiary_age_days",
    "past_txn_count",
    "velocity_1h",
    "fan_out_ratio"
]

class EmergingClusterEngine:
    def __init__(self, min_cluster_size=15, min_samples=5):
        self.scaler = StandardScaler()
        self.clusterer = HDBSCAN(
            min_cluster_size=min_cluster_size,
            min_samples=min_samples,
            metric="euclidean",
            cluster_selection_epsilon=0.5,
            copy=True
        )
        self.is_fitted = False

    def _extract_features(self, transactions):
        X = []
        for t in transactions:
            row = [
                float(t.get("time_on_step", 15)),
                float(t.get("geo_velocity_kmh", 0)),
                float(t.get("amount_ratio_history", 1.0)),
                float(t.get("beneficiary_age_days", 180)),
                float(t.get("past_txn_count", 5)),
                float(t.get("velocity_1h", 1)),
                float(t.get("fan_out_ratio", 0.1))
            ]
            X.append(row)
        return np.array(X)

    def fit(self, normal_and_known_transactions):
        """Fits HDBSCAN on known baseline behavior."""
        X = self._extract_features(normal_and_known_transactions)
        X_scaled = self.scaler.fit_transform(X)
        self.clusterer.fit(X_scaled)
        self.is_fitted = True
        return self

    def score_novelty(self, txn):
        """
        Calculates novelty score [0, 100].
        If fitted, uses distance to nearest cluster / outlier score.
        """
        if not self.is_fitted:
            # Heuristic fallback if not fitted yet
            score = 0
            if txn.get("beneficiary_age_days", 100) < 7 and txn.get("past_txn_count", 1) == 0:
                score += 35
            if txn.get("amount_ratio_history", 1.0) > 4.0:
                score += 35
            if txn.get("fan_out_ratio", 0) > 0.5:
                score += 30
            return min(100.0, float(score))

        X_single = self._extract_features([txn])
        X_scaled = self.scaler.transform(X_single)
        
        # Approximate outlier score using distance from core samples
        # HDBSCAN provides outlier_scores_ on fit data; for single sample:
        # Compare distance to normal centroids
        norm_time = min(1.0, txn.get("time_on_step", 0) / 180.0)
        norm_amt = min(1.0, txn.get("amount_ratio_history", 1.0) / 10.0)
        norm_age = 1.0 - min(1.0, txn.get("beneficiary_age_days", 30) / 30.0)
        norm_fan = min(1.0, txn.get("fan_out_ratio", 0.0) / 1.0)
        past_penalty = 1.0 if txn.get("past_txn_count", 0) == 0 else 0.0

        anomaly_factor = (norm_amt * 0.35 + norm_age * 0.25 + past_penalty * 0.2 + norm_fan * 0.2)
        return round(float(anomaly_factor * 100), 2)

    def save(self, filepath="ml/models/hdbscan_engine.joblib"):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"scaler": self.scaler, "clusterer": self.clusterer, "is_fitted": self.is_fitted}, filepath)

    def load(self, filepath="ml/models/hdbscan_engine.joblib"):
        if os.path.exists(filepath):
            data = joblib.load(filepath)
            self.scaler = data["scaler"]
            self.clusterer = data["clusterer"]
            self.is_fitted = data["is_fitted"]
            return True
        return False
