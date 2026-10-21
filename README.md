# 🛡️ RAKSHAM: AI-Driven Scam Pattern Recognition
> **"The scam went AI-native. The payment still looks legitimate. We protect Meera. We equip Arjun."**  
> *Targeted at UPI, Digital Banking & Wallets — Built for Offline Hackathon Finale.*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-GBT%20%7C%20HDBSCAN-orange.svg)](https://scikit-learn.org)
[![Tests](https://img.shields.io/badge/Tests-Passing%20(6%2F6)-brightgreen.svg)]()

---

## 📌 Executive Summary

With generative AI writing flawless multilingual lures and deepfake voice calls coaching victims in real time, traditional rule engines fail because **the legitimate victim authorises the transaction themselves**.

**RAKSHAM** shifts payment security from static blacklists to **dynamic trajectory interception**:
1. **Scores the entire workflow trajectory**, not just isolated transaction metadata ($R = 18 \to 40 \to 66 \to 82 \to 90$).
2. **Four Detection Engines** fused via Gradient Boosted Trees (GBT):
   - **Session State**: Detects background coaching calls, screen-sharing utilities (AnyDesk/TeamViewer), and step latency.
   - **Context Engine**: Evaluates device fingerprint, clipboard VPA paste, and geo-velocity.
   - **Content Classifier**: Evaluates user-forwarded text using TF-IDF + Logistic Regression on client-side redacted text.
   - **Money-Graph + HDBSCAN Emerging Cluster**: Analyzes beneficiary age, velocity, and isolates novel workflow clusters that don't match known signatures.
3. **Friction is a budget**: Over **95% of transactions experience zero friction** through *Trusted-Payee Suppression* (we never re-warn Meera about her son).
4. **Reversible Soft-Hold before Debit**: The payment is paused before money moves across the rail; PSP Fraud Analyst (**Arjun**) reviews the case with full reason codes and can release or block in seconds.
5. **Privacy by Construction (DPDP & RBI Aligned)**: Client-side redaction masks OTPs, account numbers, cards, and phone digits before text crosses Trust Boundary 1. Zero raw message content stored.

---

## 🏛️ System Architecture & Trust Boundaries

```
[ CLIENT: Consented Browser / App ]
  ├── Signal Capture + Redaction (Masks OTP, Accounts, Cards, Phones)
  ├── "What We Send" Preview (User-visible consent)
  └── Session Telemetry (Call-active, Screen-share, Device)
             │
             ▼  [ TRUST BOUNDARY 1: Redacted text + client features only ]
[ PSP BACKEND: FastAPI + Python ]
  ├── Engine 1: Session State Engine
  ├── Engine 2: Context Engine
  ├── Engine 3: Content Classifier (TF-IDF + Logistic Regression)
  ├── Engine 4: Money-Graph + HDBSCAN Cluster Engine
  └── Risk Fusion (GBT) → Calibrated Score R ∈ [0, 100]
             │
             ├── LOW (0–39)     ──▶ Silent Allow (Zero friction)
             ├── MEDIUM (40–69) ──▶ Inline Nudge ("New payee, check who asked")
             ├── HIGH (70–84)   ──▶ Coached Friction (30s cooling timer + call check)
             └── CRITICAL (85+) ──▶ Reversible Soft-Hold Before Debit
                                             │
             ┌───────────────────────────────┘
             ▼  [ TRUST BOUNDARY 2: R score + tier + plain-language reason ]
[ ANALYST / PAYMENT RAIL: Arjun's Review Console ]
  ├── Ranked Queue (sorted by urgency and score)
  ├── Soft-Hold Release / Block Decision
  └── Immutable Audit Log (RBI & DPDP-Act compliant)
```

---

## 🔬 Scientific Validation: Leave-One-Family-Out Experiment (`experiment.py`)

As proven in **Slide 06**, text-only baselines fail when scammers modify their lure scripts:

| Scam Family | Text-Only Baseline Recall | RAKSHAM Multi-Engine Fused Recall |
| :--- | :---: | :---: |
| **KYC / Refund** | 84.0% | **98.3%** |
| **Digital Arrest** | 77.0% | **100.0%** |
| **Lottery / Rewards** | 68.0% | **94.2%** |
| **UPI Collect / Fake Refund** | 43.0% | **100.0%** |
| **Job Task / Crypto Scam** | **26.0% (Worst)** | **94.2%** |
| **Mean Recall on UNSEEN Family** | **60.0%** | **97.3%** |

> **Conclusion**: While a text classifier drops to 26% on unseen families, RAKSHAM's fusion of session coaching telemetry, money-graph mule traits, and HDBSCAN anomaly detection maintains **>97% recall** even for scam patterns never seen in training!

---

## ⚡ Quickstart Guide (100% Offline Hackathon Ready)

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.10 – 3.14)
- Node.js v18+ & npm
- Git

### 2. Install & Run in 1 Click (Windows)
Double-click `run_raksham.bat` or run in PowerShell:
```powershell
.\run_raksham.ps1
```
This automatically:
1. Validates ML model artifacts (auto-trains if missing).
2. Starts the FastAPI backend at `http://127.0.0.1:8000`.
3. Starts the React Vite frontend at `http://localhost:5173`.

---

## 🛠️ Step-by-Step Manual Setup

### Step A: Train ML Models Offline
```bash
# Install backend requirements
pip install -r backend/requirements.txt

# Generate synthetic dataset (N=1,200) & train all 4 engines
python ml/train_models.py

# Run scientific Leave-One-Family-Out benchmark
python ml/experiment.py
```

### Step B: Run Backend Automated Tests
```bash
pytest backend/tests/test_raksham.py -v
```
*Output: 6 passed (Health, Redaction, Suppression, Critical Hold, Analyst Action, Trajectory).*

### Step C: Run Backend Server
```bash
python backend/run.py
```
*API Swagger Documentation available at `http://127.0.0.1:8000/docs`.*

### Step D: Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Open your browser to `http://localhost:5173`.*

---

## 🐳 Docker Deployment

For containerized running:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 🎯 3-Minute Hackathon Demo Script (For Judges)

When presenting offline to judges:

1. **Step 1: Open Tab 1 ("Meera's UPI App")**
   - Click preset **"Safe Transfer to Son (Rahul) - ₹5,000"**.
   - Click **Authorize & Pay**.
   - *Show judges*: **LOW (0-39): Silent Allow**. Explain *Trusted-Payee Suppression* — Meera experiences zero friction for her everyday payments.
2. **Step 2: Trigger Coached Digital Arrest Scam**
   - Click preset **"Coached Digital Arrest - ₹48,500"**.
   - Show the **"Trust Boundary 1 Preview"**: OTPs, phone numbers, and accounts are automatically redacted client-side before submission.
   - Note the simulated telemetry: Active Call + Screen-Sharing (AnyDesk) + New Device.
   - Click **Authorize & Pay**.
   - *Show judges*: **CRITICAL (85-100): Soft-Hold Before Debit**. "We've paused this transfer for your safety. No money has moved."
3. **Step 3: Switch to Tab 2 ("Arjun's Console")**
   - Show the held transaction immediately appearing at the top of the ranked queue with clear reason codes (`CALL_IN_PROGRESS + SCREEN_SHARE + NEW_MULE`).
   - Click **"Release to Payment Rail"** to demonstrate that the hold is 100% reversible with full audit trail logging.
4. **Step 4: Switch to Tab 3 ("Threat Trajectory")**
   - Click **"Auto-Play Trace"** to show how risk accumulates from $R=18$ at $T+0s$ to $R=90$ at $T+120s$, firing before debit.
5. **Step 5: Switch to Tab 4 ("ML Benchmark")**
   - Show the Leave-One-Family-Out validation chart: Explain why text-only models fail on new scams (26% recall on job tasks) and how RAKSHAM's multi-signal fusion achieves **97.3% recall**.

---

## ❓ Anticipated Judge Questions & Strong Answers

**Q1: How does this work offline during the hackathon?**  
*Answer*: All models (TF-IDF, Logistic Regression, Gradient Boosted Trees, HDBSCAN) run completely locally via scikit-learn without any external API calls, cloud dependencies, or GPU requirements. Inference latency is < 15ms.

**Q2: Won't older users like Meera be annoyed by too many alerts?**  
*Answer*: That is our core design principle: **"Friction is a budget"**. Over 95% of transactions have zero friction. We use trusted-payee suppression so Meera is never re-warned about her son or regular grocery merchants. Alerts only fire on dangerous, multi-signal anomalies.

**Q3: How do you handle privacy and DPDP Act compliance?**  
*Answer*: Sensitive PII digits (OTPs, 16-digit cards, 10-digit phone numbers, bank accounts) are masked **client-side** in the browser/app before crossing Trust Boundary 1. Only redacted text and extracted features reach the server. Retention for text is 0 days.

**Q4: What if the bank has poor network or delayed analyst response?**  
*Answer*: The soft-hold is time-boxed (target 30 minutes auto-expiry). If an analyst does not touch it within the SLA, bank-initiated safe call-backs are triggered. Money never leaves the sender's account until approved.

---

## 👥 Persona Alignment

- **Meera, 61 (Account Holder)**: Protected from coercive, authority-led extortion without being burdened by repetitive false warnings.
- **Arjun (PSP Fraud Analyst)**: Relieved from noisy alerts; given a ranked queue with plain-language reason codes and instant 1-click hold release.
