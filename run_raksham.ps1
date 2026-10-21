# RAKSHAM - PowerShell 1-Click Launch Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  RAKSHAM: AI-Driven Scam Pattern Recognition System" -ForegroundColor Cyan
Write-Host "  UPI * Banking * Wallets" -ForegroundColor Cyan
Write-Host "  Offline Hackathon Finale Launcher" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Verify models
if (-not (Test-Path "ml\models\risk_fusion_gbt.joblib")) {
    Write-Host "`n[1/3] Models not found. Training models offline..." -ForegroundColor Yellow
    python ml/train_models.py
    python ml/experiment.py
} else {
    Write-Host "`n[1/3] ML models verified in ml/models/" -ForegroundColor Green
}

# 2. Start Backend
Write-Host "`n[2/3] Starting FastAPI Risk Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python backend/run.py"

# 3. Start Frontend
Write-Host "`n[3/3] Starting React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --host"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  RAKSHAM is active!" -ForegroundColor Green
Write-Host "  - UI Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "  - API Docs:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green
