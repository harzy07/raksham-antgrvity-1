"""
RAKSHAM - Automated Verification & API Tests
Verifies:
1. PII Redaction engine (OTP, accounts, phones, cards)
2. Pre-transaction scoring logic (/api/score)
3. Trusted payee suppression (Son transfer = LOW risk)
4. Coached victim detection (Digital arrest + call = CRITICAL soft-hold)
5. Analyst review queue & reversible action execution (/api/analyst/action)
6. Trajectory simulation endpoint
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure app path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from main import app
from redaction import redact_text, verify_trust_boundary_redaction

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["service"] == "RAKSHAM Risk Engine"

def test_redaction_engine():
    raw_message = "Your OTP is 492019. Pay electricity bill to account 98234109219 or call officer at 9876543210. Card: 4111 2222 3333 4444."
    redacted, masked = redact_text(raw_message)

    assert "[REDACTED_OTP]" in redacted
    assert "[REDACTED_PHONE]" in redacted
    assert "[REDACTED_ACCOUNT]" in redacted
    assert "[REDACTED_CARD]" in redacted
    assert "492019" not in redacted
    assert "9876543210" not in redacted
    assert verify_trust_boundary_redaction(redacted) is True

def test_trusted_payee_suppression():
    """Slide 05: Trusted-payee suppression: we never re-warn Meera about her son."""
    payload = {
        "user_id": "meera_61",
        "beneficiary_vpa": "son_rahul@okhdfc",
        "beneficiary_name": "Rahul Verma",
        "amount": 5000.0,
        "redacted_message": "Hi Maa, sending money for groceries",
        "session": {
            "call_active": False,
            "screen_share_active": False,
            "time_on_step": 12
        },
        "context": {
            "is_new_device": False,
            "pasted_vpa": False,
            "geo_velocity_kmh": 0.0,
            "is_odd_hour": False
        }
    }
    response = client.post("/api/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["tier"] == "LOW"
    assert data["action"] == "SILENT_ALLOW"
    assert data["risk_score"] < 40.0
    assert data["is_held"] is False

def test_coached_victim_critical_hold():
    """Slide 03 & 05: Coached victim triggers CRITICAL hold before debit."""
    payload = {
        "user_id": "meera_61",
        "beneficiary_vpa": "mule_9981@okaxis",
        "beneficiary_name": "Cyber Cell Escrow Account",
        "amount": 95000.0,
        "redacted_message": "Inspector Sharma here. You are under digital arrest. Transfer [REDACTED_OTP] clearance deposit now.",
        "session": {
            "call_active": True,
            "screen_share_active": True,
            "time_on_step": 140
        },
        "context": {
            "is_new_device": True,
            "pasted_vpa": True,
            "geo_velocity_kmh": 0.0,
            "is_odd_hour": False
        }
    }
    response = client.post("/api/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["tier"] == "CRITICAL"
    assert data["action"] == "SOFT_HOLD_BEFORE_DEBIT"
    assert data["risk_score"] >= 85.0
    assert data["is_held"] is True
    assert "CALL_IN_PROGRESS" in data["reason_code"]

def test_analyst_review_and_release():
    """Slide 08 & A3: Analyst reviews case, can release or block."""
    # Get current queue
    q_resp = client.get("/api/analyst/queue")
    assert q_resp.status_code == 200
    queue = q_resp.json()
    assert len(queue) > 0

    target_case = queue[0]
    txn_id = target_case["txn_id"]

    # Release case
    action_payload = {
        "txn_id": txn_id,
        "action": "RELEASE",
        "analyst_name": "Arjun (PSP Fraud Ops)",
        "notes": "Verified genuine after secure bank call-back."
    }
    action_resp = client.post("/api/analyst/action", json=action_payload)
    assert action_resp.status_code == 200
    res = action_resp.json()
    assert res["status"] == "success"
    assert res["case"]["status"] == "RELEASED_TO_RAIL"

def test_trajectory_simulation():
    """Verifies Slide 03 synthetic threat scenario simulation."""
    resp = client.post("/api/simulate/trajectory")
    assert resp.status_code == 200
    steps = resp.json()
    assert len(steps) == 5
    assert steps[0]["risk_score"] == 18.0
    assert steps[-1]["risk_score"] == 90.0
    assert steps[-1]["tier"] == "CRITICAL"
