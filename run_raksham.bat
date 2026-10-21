@echo off
TITLE RAKSHAM Launcher
echo ========================================================
echo   RAKSHAM: AI-Driven Scam Pattern Recognition System
echo   UPI * Banking * Wallets
echo   Offline Hackathon Finale Launcher
echo ========================================================
echo.

echo [1/3] Checking Python dependencies and models...
if not exist "ml\models\risk_fusion_gbt.joblib" (
    echo Models not found. Training models offline...
    python ml/train_models.py
    python ml/experiment.py
)

echo.
echo [2/3] Launching FastAPI Backend on port 8000...
start "RAKSHAM Backend" cmd /k "python backend/run.py"

echo.
echo [3/3] Launching Vite React Frontend on port 5173...
start "RAKSHAM Frontend" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo ========================================================
echo   RAKSHAM is booting up!
echo   - Backend API: http://127.0.0.1:8000 (Docs: /docs)
echo   - Web Dashboard: http://localhost:5173
echo ========================================================
echo.
pause
