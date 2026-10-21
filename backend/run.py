"""
RAKSHAM - Backend Entrypoint
Starts Uvicorn server on port 8000
"""

import sys
import os
import uvicorn

# Ensure backend/app is in Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

if __name__ == "__main__":
    print("=" * 60)
    print("RAKSHAM: AI-Driven Scam Pattern Recognition System")
    print("Starting Pre-Transaction Risk API on http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
