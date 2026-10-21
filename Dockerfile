FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy frontend package.json and install
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
RUN npm run build
WORKDIR /app

# Copy all code
COPY . .

# Train models if not present
RUN python ml/train_models.py && python ml/experiment.py

EXPOSE 8000 5173

CMD ["python", "backend/run.py"]
