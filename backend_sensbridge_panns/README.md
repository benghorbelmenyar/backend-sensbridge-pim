# SenseBridge Sound Detection (PANNs) Backend

Production-ready backend for sound event classification using PANNs CNN14 (AudioSet). Supports file/bytes upload, history, settings, and real-time WebSocket predictions.

## Stack

- Python 3.11+, FastAPI, Uvicorn
- PANNs inference (PyTorch) via `panns-inference`
- PostgreSQL, SQLAlchemy 2.0, Alembic
- Docker + docker-compose

## Quick start

```bash
# Build and run (model downloads on first request if not present)
docker-compose up --build
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  
- Ready (model + DB): http://localhost:8000/ready  

## Dev server

```bash
# Create venv and install
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt

# PostgreSQL running locally with DB sensbridge_panns
cp .env.example .env
# Edit .env: DATABASE_URL, MODEL_DIR, etc.

# Migrations
set PYTHONPATH=.   # or export PYTHONPATH=.
alembic -c alembic.ini upgrade head

# Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Model storage

- Weights are stored under `MODEL_DIR` (default `./models` in dev, `/app/models` in Docker).
- On first run, the service downloads **Cnn14_mAP=0.431.pth** (~1.4 GB) from Zenodo if the file is missing. Logs will show "Downloading PANNs CNN14 model from Zenodo (first run only)".
- To avoid repeated downloads, use a volume for `MODEL_DIR` (e.g. `panns_models` in docker-compose).

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/ready` | Readiness (model loaded + DB) |
| POST | `/v1/sound/predict` | Classify audio (file or raw bytes); persists event if above threshold |
| GET | `/v1/sound/events` | List events (query: `from`, `to`, `type`, `limit`) |
| GET | `/v1/sound/events/latest` | Latest events |
| GET | `/v1/sound/settings` | Detection settings |
| PUT | `/v1/sound/settings` | Update settings (global_threshold, per_type_thresholds) |
| WS | `/v1/sound/stream` | Real-time predictions on audio chunks |

## Example: predict (curl)

**File upload (WAV):**

```bash
curl -X POST http://localhost:8000/v1/sound/predict \
  -F "file=@sample.wav" \
  -F "device_id=dev-1"
```

**Optional form fields:** `sample_rate`, `device_id`.

**Raw PCM bytes (e.g. int16 mono 32 kHz):**

```bash
# Send raw bytes as multipart
curl -X POST http://localhost:8000/v1/sound/predict \
  -F "audio_bytes=@raw_audio.pcm" \
  -F "sample_rate=32000"
```

Response shape:

```json
{
  "request_id": "...",
  "timestamp": "...",
  "top_k": [
    {"label": "Baby cry, infant cry", "score": 0.92},
    {"label": "Siren", "score": 0.31}
  ],
  "primary": {"label": "Baby cry, infant cry", "score": 0.92},
  "mapping": {"sound_type": "baby_cry"}
}
```

## Example: WebSocket

Connect to `ws://localhost:8000/v1/sound/stream` and send either:

1. **Binary:** raw PCM audio chunks (e.g. mono float32 or int16 at 32 kHz).  
2. **Text (JSON):** `{"audio": "<base64-encoded-audio>", "sample_rate": 32000}`.

Server replies with the same prediction JSON (or `error`/`message` on failure).

**Minimal Python client (binary chunk):**

```python
import asyncio
import websockets
import json
import numpy as np

async def main():
    uri = "ws://localhost:8000/v1/sound/stream"
    async with websockets.connect(uri) as ws:
        # Send a small dummy mono float32 chunk (e.g. 1 sec at 32k)
        chunk = np.zeros(32000, dtype=np.float32)
        await ws.send(chunk.tobytes())
        msg = await ws.recv()
        print(json.loads(msg))

asyncio.run(main())
```

**Base64 JSON:**

```python
import base64
await ws.send(json.dumps({"audio": base64.b64encode(chunk.tobytes()).decode(), "sample_rate": 32000}))
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Async PostgreSQL URL |
| `MODEL_DIR` | `./models` | Directory for PANNs weights |
| `GLOBAL_THRESHOLD` | `0.85` | Default confidence threshold for persisting events |
| `LOG_LEVEL` | `INFO` | Logging level |
| `CORS_ORIGINS` | `["http://localhost:3000", ...]` | Allowed CORS origins |

## Tests

```bash
# From project root (backend_sensbridge_panns)
pip install -r requirements.txt
set PYTHONPATH=.
pytest tests -v
```

- **Unit:** Preprocessing shape, label mapping (no DB required).  
- **Integration:** `/v1/sound/predict`, events, settings (use in-memory SQLite; if you see dialect errors, run with PostgreSQL: `docker compose up -d db` and set `DATABASE_URL`).  
- **WebSocket:** Connect, send small dummy frame, receive prediction JSON.

## License

Internal / project default.
