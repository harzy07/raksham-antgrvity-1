"""
RAKSHAM - Privacy & Data Minimisation Engine (Trust Boundary 1)
Client-side & Server-side Redaction (Defense-in-depth).
Masks OTP, bank accounts, 16-digit card numbers, and 10-digit phone numbers before text crosses trust boundary.
DPDP-Act & RBI privacy aligned.
"""

import re
from typing import Tuple, List, Dict

# Regex patterns for sensitive financial and identity digits
PHONE_REGEX = re.compile(r'(?<!\d)(?:\+?91[\-\s]?)?[6-9]\d{9}(?!\d)')
CARD_REGEX = re.compile(r'(?<!\d)(?:\d{4}[ \-]?){3}\d{4}(?!\d)')
ACCOUNT_REGEX = re.compile(r'(?:(?:\b(?:A\/C|acc|account|acct)[\s:#]*([0-9]{9,18}))|(?<!\d)([0-9]{11,18})(?!\d))', re.IGNORECASE)
OTP_REGEX = re.compile(r'\b(?:otp|code|pin|verification\s*code)?[\s:#]*([0-9]{4,6})\b', re.IGNORECASE)

def redact_text(text: str) -> Tuple[str, List[Dict[str, str]]]:
    """
    Redacts sensitive PII digits from user forwarded text.
    Returns: (redacted_string, list_of_detected_masked_entities)
    """
    if not text:
        return "", []

    masked_entities = []
    redacted = text

    # 1. Mask 16-digit Credit/Debit Cards
    for match in CARD_REGEX.finditer(redacted):
        raw = match.group(0)
        masked_entities.append({"type": "CARD_NUMBER", "original_snippet": f"****{raw[-4:]}"})
        redacted = redacted.replace(raw, "[REDACTED_CARD]")

    # 2. Mask Indian Phone Numbers (10 digits starting with 6-9)
    for match in PHONE_REGEX.finditer(redacted):
        raw = match.group(0)
        if not raw.startswith("[REDACTED"):
            masked_entities.append({"type": "PHONE_NUMBER", "original_snippet": f"****{raw[-4:]}"})
            redacted = redacted.replace(raw, "[REDACTED_PHONE]")

    # 3. Mask Bank Account numbers
    for match in ACCOUNT_REGEX.finditer(redacted):
        raw = match.group(1) or match.group(2) or match.group(0)
        if len(raw) >= 9 and not raw.startswith("[REDACTED"):
            masked_entities.append({"type": "BANK_ACCOUNT", "original_snippet": f"****{raw[-4:]}"})
            redacted = redacted.replace(raw, "[REDACTED_ACCOUNT]")

    # 4. Mask OTP / 4-6 digit numeric codes
    # Avoid replacing words that look like years e.g. 2026 or small numbers
    def otp_replace(m):
        full_match = m.group(0)
        digits = m.group(1) if m.lastindex else full_match
        if digits in ["2024", "2025", "2026"]: # allow year
            return full_match
        masked_entities.append({"type": "OTP_CODE", "original_snippet": "***"})
        return full_match.replace(digits, "[REDACTED_OTP]")

    redacted = OTP_REGEX.sub(otp_replace, redacted)

    return redacted, masked_entities

def verify_trust_boundary_redaction(text: str) -> bool:
    """
    Server-side defence-in-depth check.
    Returns True if text is safely redacted and contains no raw 10-digit phone numbers or 16-digit cards.
    """
    if not text:
        return True
    if CARD_REGEX.search(text):
        return False
    if PHONE_REGEX.search(text):
        return False
    return True
