"""
RAKSHAM - AI Model Training Suite
Trains:
1. Content Classifier: TF-IDF (1-2 gram) + Logistic Regression
2. Risk Fusion Model: Gradient Boosted Trees (GBT) over multi-signal feature vector
3. Emerging-Cluster Engine: HDBSCAN on workflow metrics

Exports lightweight artifacts ready for offline inference in the hackathon final round!
"""

import os
import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve

from synthetic_data import generate_synthetic_dataset
from emerging_cluster import EmergingClusterEngine

def train_all():
    print("=" * 60)
    print("RAKSHAM: Starting Model Training Pipeline")
    print("=" * 60)

    data_file = "ml/data/synthetic_transactions.json"
    if not os.path.exists(data_file):
        print("Generating synthetic dataset (N=1,200)...")
        dataset = generate_synthetic_dataset(1200, data_file)
    else:
        with open(data_file, "r", encoding="utf-8") as f:
            dataset = json.load(f)

    # 1. Train Content Classifier (TF-IDF + Logistic Regression)
    print("\n[Engine 3] Training Content Classifier (TF-IDF + Logistic Regression)...")
    texts = [d["message"] for d in dataset]
    text_labels = np.array([d["is_scam"] for d in dataset])

    X_train_txt, X_test_txt, y_train_txt, y_test_txt = train_test_split(
        texts, text_labels, test_size=0.2, random_state=42, stratify=text_labels
    )

    tfidf = TfidfVectorizer(ngram_range=(1, 2), max_features=3000, sublinear_tf=True)
    X_train_vec = tfidf.fit_transform(X_train_txt)
    X_test_vec = tfidf.transform(X_test_txt)

    clf_text = LogisticRegression(C=1.5, max_iter=500, class_weight="balanced", random_state=42)
    clf_text.fit(X_train_vec, y_train_txt)

    test_preds_prob = clf_text.predict_proba(X_test_vec)[:, 1]
    test_preds = (test_preds_prob >= 0.5).astype(int)

    print("Content Classifier Performance (Known families):")
    print(classification_report(y_test_txt, test_preds, digits=3))

    # 2. Fit Emerging Cluster Engine (HDBSCAN)
    print("\n[Engine 4] Fitting Emerging Cluster Engine (HDBSCAN)...")
    cluster_engine = EmergingClusterEngine()
    cluster_engine.fit(dataset)
    cluster_engine.save("ml/models/hdbscan_engine.joblib")
    print("HDBSCAN model saved successfully.")

    # 3. Train Risk Fusion Model (Gradient Boosted Trees)
    print("\n[Risk Fusion] Training Gradient Boosted Trees Fusion Scorer...")
    # Generate content probabilities and novelty scores for all data
    all_text_vecs = tfidf.transform(texts)
    content_probs = clf_text.predict_proba(all_text_vecs)[:, 1]

    fusion_feature_rows = []
    for i, d in enumerate(dataset):
        novelty_score = cluster_engine.score_novelty(d) / 100.0
        row = [
            float(content_probs[i]),
            float(d.get("call_active", 0)),
            float(d.get("screen_share_active", 0)),
            float(min(300, d.get("time_on_step", 15)) / 300.0),
            float(d.get("new_device", 0)),
            float(d.get("pasted_vpa", 0)),
            float(min(800, d.get("geo_velocity_kmh", 0)) / 800.0),
            float(d.get("odd_hour", 0)),
            float(min(15.0, d.get("amount_ratio_history", 1.0)) / 15.0),
            float(1.0 - min(1.0, d.get("beneficiary_age_days", 30) / 90.0)),
            float(1.0 if d.get("past_txn_count", 0) == 0 else 0.0),
            float(min(10, d.get("velocity_1h", 1)) / 10.0),
            float(min(1.0, d.get("fan_out_ratio", 0.0))),
            float(novelty_score)
        ]
        fusion_feature_rows.append(row)

    X_fusion = np.array(fusion_feature_rows)
    y_fusion = np.array([d["is_scam"] for d in dataset])

    X_train_f, X_test_f, y_train_f, y_test_f = train_test_split(
        X_fusion, y_fusion, test_size=0.2, random_state=42, stratify=y_fusion
    )

    gbt = GradientBoostingClassifier(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=3,
        subsample=0.85,
        random_state=42
    )
    gbt.fit(X_train_f, y_train_f)

    test_f_probs = gbt.predict_proba(X_test_f)[:, 1]
    print(f"Risk Fusion ROC-AUC: {roc_auc_score(y_test_f, test_f_probs):.4f}")

    # Feature Importance
    feature_names = [
        "content_prob", "call_active", "screen_share_active", "time_on_step",
        "new_device", "pasted_vpa", "geo_velocity", "odd_hour",
        "amount_ratio_history", "beneficiary_recency", "first_time_payee",
        "velocity_1h", "fan_out_ratio", "novelty_cluster"
    ]
    importances = sorted(zip(feature_names, gbt.feature_importances_), key=lambda x: x[1], reverse=True)
    print("\nTop Risk Drivers (GBT Feature Importances):")
    for name, imp in importances[:8]:
        print(f"  - {name:22s}: {imp * 100:.2f}%")

    # 4. Save Models
    os.makedirs("ml/models", exist_ok=True)
    joblib.dump(tfidf, "ml/models/tfidf_vectorizer.joblib")
    joblib.dump(clf_text, "ml/models/content_classifier.joblib")
    joblib.dump(gbt, "ml/models/risk_fusion_gbt.joblib")

    # Metadata for offline inference
    metadata = {
        "n_samples": len(dataset),
        "features": feature_names,
        "feature_importances": dict(importances),
        "target_latency_ms": "< 15ms local inference",
        "trained_date": "2026-10-21"
    }
    with open("ml/models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("\nAll model artifacts successfully exported to ml/models/!")
    print("=" * 60)

if __name__ == "__main__":
    train_all()
