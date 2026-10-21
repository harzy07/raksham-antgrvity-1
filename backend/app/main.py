"""
RAKSHAM - FastAPI Application
AI-Driven Scam Pattern Recognition for UPI, Banking & Wallets
Pre-transaction Risk API on the Payment Path (< 300ms inline target)
"""

import os
import json
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    PaymentScoreRequest, PaymentScoreResponse,
    RedactionRequest, RedactionResponse,
    AnalystActionRequest, TrajectoryStepSimulation
)
from engines import RakshamRiskSystem
from redaction import redact_text, verify_trust_boundary_redaction
from store import store

app = FastAPI(
    title="RAKSHAM Backend API",
    description="AI-Driven Scam Pattern Recognition for UPI, Banking & Wallets",
    version="1.0.0"
)

# CORS configuration for offline local prototyping
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_system = RakshamRiskSystem(models_dir="ml/models")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RAKSHAM Risk Engine",
        "mode": "offline-ready",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/redact", response_model=RedactionResponse)
def redact_client_text(payload: RedactionRequest):
    """
    Client-side signal capture helper (Trust Boundary 1 preview).
    Shows the user 'what we send' with OTP, accounts, cards, and phone numbers masked.
    """
    redacted, masked_entities = redact_text(payload.raw_text)
    return RedactionResponse(
        redacted_text=redacted,
        masked_entities=masked_entities
    )

@app.post("/api/score", response_model=PaymentScoreResponse)
def score_payment_transaction(payload: PaymentScoreRequest):
    """
    Inline Pre-Transaction Risk Call on the Payment Path.
    Target latency: < 300 ms.
    """
    # 1. Defence-in-depth Trust Boundary 1 validation
    if payload.redacted_message:
        if not verify_trust_boundary_redaction(payload.redacted_message):
            # Auto-redact server-side if client missed any raw digits
            payload.redacted_message, _ = redact_text(payload.redacted_message)

    # 2. Risk evaluation through all 4 engines + GBT fusion
    result = risk_system.score_transaction(payload)

    txn_id = f"TXN_{uuid.uuid4().hex[:6].upper()}"

    resp_data = {
        "txn_id": txn_id,
        "risk_score": result["risk_score"],
        "tier": result["tier"],
        "action": result["action"],
        "reason_code": result["reason_code"],
        "user_prompt": result["user_prompt"],
        "cooling_off_seconds": result["cooling_off_seconds"],
        "is_held": result["is_held"],
        "breakdown": result["breakdown"],
        "latency_ms": result["latency_ms"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        # Internal fields for store
        "user_id": payload.user_id,
        "beneficiary_vpa": payload.beneficiary_vpa,
        "beneficiary_name": payload.beneficiary_name or "New Payee",
        "amount": payload.amount,
        "redacted_message": payload.redacted_message
    }

    # 3. Record in audit trail & analyst queue if held
    store.record_score_result(resp_data)

    return PaymentScoreResponse(**resp_data)

@app.get("/api/analyst/queue")
def get_analyst_review_queue():
    """Returns pending CRITICAL soft-holds ranked by risk score."""
    return store.get_ranked_queue()

@app.post("/api/analyst/action")
def execute_analyst_action(payload: AnalystActionRequest):
    """
    Arjun's Console Action:
    - RELEASE: Releases soft-hold, passes transaction to payment rail.
    - BLOCK: Confirms fraud, adds to mule blacklist.
    """
    res = store.execute_analyst_action(
        payload.txn_id, payload.action, payload.analyst_name, payload.notes
    )
    if not res:
        raise HTTPException(status_code=404, detail="Case not found in active review queue")
    return {"status": "success", "case": res}

@app.get("/api/analyst/audit-log")
def get_immutable_audit_log(limit: int = 50):
    """Immutable audit log for regulatory reporting (RBI / DPDP-Act)."""
    return store.get_audit_trail(limit)

@app.get("/api/experiment/results")
def get_scientific_validation_results():
    """Returns the Leave-One-Family-Out validation benchmark (Slide 06)."""
    results_path = "ml/data/experiment_results.json"
    if os.path.exists(results_path):
        with open(results_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"status": "pending", "message": "Run ml/experiment.py to generate benchmark results."}

@app.get("/api/ml/metadata")
def get_model_metadata():
    """Returns model training metadata, GBT feature importances, and latency stats."""
    meta_path = "ml/models/model_metadata.json"
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "status": "active",
        "target_latency_ms": "< 15ms local inference",
        "pipeline": "TF-IDF + Logistic, GBT Fusion, HDBSCAN"
    }

@app.post("/api/simulate/trajectory")
def simulate_coached_victim_trajectory():
    """
    Simulates the 5-step synthetic threat scenario from Slide 03 & Slide A2:
    T+0s -> T+60s -> T+95s -> T+110s -> T+120s
    Shows risk accumulating silently before debit, triggering soft-hold before any money moves.
    """
    steps = [
        {
            "step_id": 1,
            "time_label": "T+0s",
            "event_name": "Scam Call + Forwarded Message",
            "description": "Deepfake 'police' call, then a lure message. Browser redacts digits client-side.",
            "risk_score": 18.0,
            "tier": "LOW",
            "action": "SILENT_ALLOW",
            "reasons": ["COERCIVE_SCAM_VOCABULARY_DETECTED"],
            "engines_involved": ["Content Classifier", "Session State"]
        },
        {
            "step_id": 2,
            "time_label": "T+60s",
            "event_name": "Screen-Share + New Device",
            "description": "Victim installs screen-share app (AnyDesk); login detected from unfamiliar device.",
            "risk_score": 40.0,
            "tier": "MEDIUM",
            "action": "INLINE_NUDGE",
            "reasons": ["SCREEN_SHARING_APP_ACTIVE", "NEW_DEVICE_LOGIN"],
            "engines_involved": ["Session State", "Context Engine"]
        },
        {
            "step_id": 3,
            "time_label": "T+95s",
            "event_name": "New Mule Payee",
            "description": "Beneficiary VPA is 2 days fresh, never transacted; amount (Rs 48,500) far above user's normal average.",
            "risk_score": 66.0,
            "tier": "MEDIUM",
            "action": "INLINE_NUDGE",
            "reasons": ["NEW_BENEFICIARY_FIRST_TIME", "AMOUNT_ABOVE_HISTORICAL_AVERAGE"],
            "engines_involved": ["Money-Graph Engine"]
        },
        {
            "step_id": 4,
            "time_label": "T+110s",
            "event_name": "Novel Pattern (Emerging Cluster)",
            "description": "Workflow matches no known static signature; flagged as a candidate anomaly cluster by HDBSCAN.",
            "risk_score": 82.0,
            "tier": "HIGH",
            "action": "COACHED_VICTIM_FRICTION",
            "reasons": ["EMERGING_UNSEEN_WORKFLOW_CLUSTER", "CALL_IN_PROGRESS_COACHING_SUSPECTED"],
            "engines_involved": ["Emerging-Cluster Engine (HDBSCAN)"]
        },
        {
            "step_id": 5,
            "time_label": "T+120s",
            "event_name": "HOLD Before Debit",
            "description": "Payment initiated; cumulative score crosses CRITICAL (90); reversible soft-hold fires before money leaves bank.",
            "risk_score": 90.0,
            "tier": "CRITICAL",
            "action": "SOFT_HOLD_BEFORE_DEBIT",
            "reasons": ["HIGH_RISK_COACHED_EXTORTION", "COACHED_SUSPECTED_CALL_ACTIVE", "NEW_MULE_VPA"],
            "engines_involved": ["Risk Fusion (GBT) -> SOFT-HOLD"]
        }
    ]
    return steps
