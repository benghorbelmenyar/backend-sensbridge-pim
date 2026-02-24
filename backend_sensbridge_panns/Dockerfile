# SenseBridge PANNs backend
FROM python:3.11-slim

WORKDIR /app

# System deps for audio (optional, for some codecs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Model dir will be created at runtime; optionally mount a volume
ENV MODEL_DIR=/app/models
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Run migrations then server (simple approach; for production use init container for migrations)
CMD ["sh", "-c", "alembic -c alembic.ini upgrade head 2>/dev/null || true; uvicorn app.main:app --host 0.0.0.0 --port 8000"]
