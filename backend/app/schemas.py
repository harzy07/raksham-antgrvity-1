"""
RAKSHAM - API Schemas & Data Models
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SessionSignals(BaseModel):
    call_active: bool = Field(False, description="Whether phone or VoIP/Skype call is ongoing")
    screen_share_active: bool = Field(False, description="Whether screen sharing app (AnyDesk, TeamViewer) is active")
    time_on_step: int = Field(15, description="Seconds spent on current payment flow screen")
    app_switched_count: int = Field(0, description="Number of app switches between chat and banking")

class ContextSignals(BaseModel):
    device_id: str = Field("DEV_DEFAULT", description="Device hardware fingerprint")
    is_new_device: bool = Field(False, description="Device first seen < 48 hours ago")
    pasted_vpa: bool = Field(False, description="Whether VPA was pasted from clipboard")
    geo_velocity_kmh: float = Field(0.0, description="Calculated velocity between last login and current")
    is_odd_hour: bool = Field(False, description="Payment initiated between 12 AM and 5 AM")

class PaymentScoreRequest(BaseModel):
    user_id: str = Field("meera_61", description="Account holder ID")
    beneficiary_vpa: str = Field(..., description="Target UPI ID / VPA")
    beneficiary_name: Optional[str] = Field("Unknown Payee", description="Beneficiary account name")
    amount: float = Field(..., description="Payment amount in INR")
    redacted_message: Optional[str] = Field(None, description="User-forwarded message text with digits masked")
    session: SessionSignals = Field(default_factory=SessionSignals)
    context: ContextSignals = Field(default_factory=ContextSignals)
    synthetic_step: Optional[str] = Field(None, description="Optional step identifier for demo trajectory (e.g. T+0s, T+60s)")

class EngineBreakdown(BaseModel):
    content_risk: float
    session_risk: float
    context_risk: float
    money_graph_risk: float
    novelty_anomaly_score: float

class PaymentScoreResponse(BaseModel):
    txn_id: str
    risk_score: float = Field(..., description="Score R in [0, 100]")
    tier: str = Field(..., description="LOW, MEDIUM, HIGH, or CRITICAL")
    action: str = Field(..., description="SILENT_ALLOW, INLINE_NUDGE, COACHED_VICTIM_FRICTION, SOFT_HOLD_BEFORE_DEBIT")
    reason_code: str = Field(..., description="Plain-language audit reason code")
    user_prompt: str = Field(..., description="User-facing explanation / intervention dialogue")
    cooling_off_seconds: int = Field(0, description="Cooldown timer for HIGH tier")
    is_held: bool = Field(False, description="True if payment is soft-held before debit")
    breakdown: EngineBreakdown
    latency_ms: float
    timestamp: str

class RedactionRequest(BaseModel):
    raw_text: str

class RedactionResponse(BaseModel):
    redacted_text: str
    masked_entities: List[Dict[str, str]]

class AnalystActionRequest(BaseModel):
    txn_id: str
    action: str = Field(..., description="RELEASE or BLOCK")
    analyst_name: str = Field("Arjun (PSP Fraud Ops)")
    notes: Optional[str] = Field(None, description="Optional analyst notes")

class TrajectoryStepSimulation(BaseModel):
    step_id: int
    time_label: str
    event_name: str
    description: str
    risk_score: float
    tier: str
    action: str
    reasons: List[str]
