"""
RAKSHAM - Transaction Store, Analyst Review Queue & Immutable Audit Log
Supports:
- Live ranked queue for Fraud Analyst (Arjun)
- Reversible Soft-Hold release / block actions
- Immutable audit log tracking with timestamps & reason codes
- Initialized with realistic cases for offline demo readiness
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

class RakshamStore:
    def __init__(self):
        # In-memory stores
        self.transactions: Dict[str, Dict[str, Any]] = {}
        self.analyst_queue: Dict[str, Dict[str, Any]] = {}
        self.audit_log: List[Dict[str, Any]] = []
        self._seed_demo_data()

    def _seed_demo_data(self):
        """Pre-seeds realistic fraud cases so Arjun's console is immediately demo-ready."""
        cases = [
            {
                "txn_id": "TXN_9801",
                "user_id": "meera_61",
                "beneficiary_vpa": "mule_4921@okaxis",
                "beneficiary_name": "Digital Escrow Pvt Ltd",
                "amount": 48500.0,
                "risk_score": 92.4,
                "tier": "CRITICAL",
                "reason_code": "CALL_IN_PROGRESS_COACHING_SUSPECTED + SCREEN_SHARING_APP_ACTIVE + NEW_BENEFICIARY_FIRST_TIME",
                "user_prompt": "We've paused this transfer for your safety. An analyst is reviewing. Your bank will call you on a verified line. No money has moved.",
                "status": "HELD",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "time_held_secs": 140,
                "breakdown": {
                    "content_risk": 94.0,
                    "session_risk": 88.0,
                    "context_risk": 75.0,
                    "money_graph_risk": 85.0,
                    "novelty_anomaly_score": 82.0
                },
                "redacted_message": "[REDACTED_PHONE] Digital arrest warrant from Crime Branch CBI. Transfer Rs 48,500 security collateral to avoid immediate arrest."
            },
            {
                "txn_id": "TXN_9802",
                "user_id": "ramesh_58",
                "beneficiary_vpa": "mule_8120@paytm",
                "beneficiary_name": "Bescom Power Verification",
                "amount": 24000.0,
                "risk_score": 87.5,
                "tier": "CRITICAL",
                "reason_code": "CALL_IN_PROGRESS_COACHING_SUSPECTED + NEW_BENEFICIARY_FIRST_TIME + COERCIVE_SCAM_VOCABULARY",
                "user_prompt": "We've paused this transfer for your safety. An analyst is reviewing. Your bank will call you on a verified line. No money has moved.",
                "status": "HELD",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "time_held_secs": 210,
                "breakdown": {
                    "content_risk": 89.0,
                    "session_risk": 75.0,
                    "context_risk": 60.0,
                    "money_graph_risk": 80.0,
                    "novelty_anomaly_score": 68.0
                },
                "redacted_message": "Electricity bill overdue. Power disconnect tonight 9:30 PM. Pay Rs 24,000 security buffer immediately."
            },
            {
                "txn_id": "TXN_9803",
                "user_id": "ananya_22",
                "beneficiary_vpa": "crypto_pool_99@upi",
                "beneficiary_name": "Telegram VIP Pool",
                "amount": 15000.0,
                "risk_score": 85.2,
                "tier": "CRITICAL",
                "reason_code": "EMERGING_UNSEEN_WORKFLOW_CLUSTER + NEW_BENEFICIARY_FIRST_TIME",
                "user_prompt": "We've paused this transfer for your safety. An analyst is reviewing. Your bank will call you on a verified line. No money has moved.",
                "status": "HELD",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "time_held_secs": 380,
                "breakdown": {
                    "content_risk": 80.0,
                    "session_risk": 30.0,
                    "context_risk": 55.0,
                    "money_graph_risk": 82.0,
                    "novelty_anomaly_score": 90.0
                },
                "redacted_message": "YouTube like task tier 2 prepaid task. Deposit Rs 15,000 to earn Rs 22,500 return in 10 minutes."
            }
        ]

        for c in cases:
            self.transactions[c["txn_id"]] = c
            self.analyst_queue[c["txn_id"]] = c
            self.audit_log.append({
                "audit_id": f"AUD_{uuid.uuid4().hex[:8]}",
                "timestamp": c["created_at"],
                "event": "TRANSACTION_EVALUATED_AND_HELD",
                "txn_id": c["txn_id"],
                "risk_score": c["risk_score"],
                "tier": c["tier"],
                "reason_code": c["reason_code"]
            })

    def record_score_result(self, record: Dict[str, Any]):
        txn_id = record.get("txn_id") or f"TXN_{uuid.uuid4().hex[:6].upper()}"
        record["txn_id"] = txn_id
        record["created_at"] = datetime.now(timezone.utc).isoformat()
        self.transactions[txn_id] = record

        # If CRITICAL, add to Analyst Review Queue
        if record.get("tier") == "CRITICAL" and record.get("is_held"):
            record["status"] = "HELD"
            record["time_held_secs"] = 0
            self.analyst_queue[txn_id] = record

        # Immutable Audit Log
        self.audit_log.append({
            "audit_id": f"AUD_{uuid.uuid4().hex[:8]}",
            "timestamp": record["created_at"],
            "event": "PAYMENT_INTERVENTION_TRIGGERED" if record.get("tier") != "LOW" else "PAYMENT_SILENT_ALLOWED",
            "txn_id": txn_id,
            "risk_score": record.get("risk_score"),
            "tier": record.get("tier"),
            "reason_code": record.get("reason_code")
        })

    def get_ranked_queue(self) -> List[Dict[str, Any]]:
        """Returns held cases ranked by risk score descending."""
        items = list(self.analyst_queue.values())
        return sorted(items, key=lambda x: x["risk_score"], reverse=True)

    def execute_analyst_action(self, txn_id: str, action: str, analyst_name: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Executes Arjun's decision (RELEASE to payment rail or BLOCK fraud mule)."""
        if txn_id not in self.analyst_queue:
            return None

        case = self.analyst_queue.pop(txn_id)
        now = datetime.now(timezone.utc).isoformat()
        new_status = "RELEASED_TO_RAIL" if action.upper() == "RELEASE" else "BLOCKED_MULE_IDENTIFIED"
        case["status"] = new_status
        case["reviewed_by"] = analyst_name
        case["reviewed_at"] = now
        case["analyst_notes"] = notes or ("False positive release" if action.upper() == "RELEASE" else "Confirmed coercive digital arrest mule")

        self.transactions[txn_id] = case

        self.audit_log.append({
            "audit_id": f"AUD_{uuid.uuid4().hex[:8]}",
            "timestamp": now,
            "event": f"ANALYST_{action.upper()}_DECISION",
            "txn_id": txn_id,
            "analyst": analyst_name,
            "status": new_status,
            "notes": case["analyst_notes"]
        })

        return case

    def get_audit_trail(self, limit: int = 50) -> List[Dict[str, Any]]:
        return list(reversed(self.audit_log))[:limit]

# Singleton instance
store = RakshamStore()
