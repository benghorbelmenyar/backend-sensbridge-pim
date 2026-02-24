"""In-memory WebSocket broadcast hub for real-time predictions."""
import asyncio
import base64
import json
import uuid
from typing import Any

from loguru import logger

from app.core.config import settings
from app.ml.panns_model import inference as model_inference
from app.ml.preprocess import (
    preprocess_audio,
    load_audio_from_bytes,
    audio_to_model_input,
)
from app.ml.label_mapping import audioset_label_to_sound_type

# In-memory set of connected WebSocket connections (broadcast)
_connections: set[Any] = set()
_lock = asyncio.Lock()


async def register(websocket: Any) -> None:
    async with _lock:
        _connections.add(websocket)
    logger.info("WebSocket connected", total=len(_connections))


async def unregister(websocket: Any) -> None:
    async with _lock:
        _connections.discard(websocket)
    logger.info("WebSocket disconnected", total=len(_connections))


async def broadcast(message: dict[str, Any]) -> None:
    if not _connections:
        return
    text = json.dumps(message)
    dead = set()
    for ws in list(_connections):
        try:
            await asyncio.wait_for(ws.send_text(text), timeout=5.0)
        except Exception:
            dead.add(ws)
    async with _lock:
        for ws in dead:
            _connections.discard(ws)


def _chunk_to_audio(data: bytes | str, sample_rate: int | None) -> tuple[Any, int]:
    """Decode chunk: raw bytes or base64 JSON {b64, sample_rate?}."""
    if isinstance(data, str):
        try:
            obj = json.loads(data)
            b64 = obj.get("audio") or obj.get("b64")
            sr = obj.get("sample_rate") or sample_rate or settings.sample_rate
            if b64:
                data = base64.b64decode(b64)
            else:
                return None, sr
        except Exception:
            return None, sample_rate or settings.sample_rate
    sr = sample_rate or settings.sample_rate
    return data, sr


async def process_audio_chunk(
    chunk: bytes | str,
    sample_rate: int | None = None,
    device_id: str | None = None,
) -> dict[str, Any]:
    """
    Process one audio chunk and return prediction payload.
    chunk: raw PCM bytes or base64-encoded JSON with "audio" / "b64" and optional "sample_rate".
    """
    request_id = str(uuid.uuid4())
    data, sr = _chunk_to_audio(chunk, sample_rate)
    if data is None or len(data) < 1024:
        return {
            "request_id": request_id,
            "error": "insufficient_audio",
            "message": "Provide raw PCM bytes or base64 JSON with 'audio' key",
        }
    # Enforce max size
    max_bytes = getattr(settings, "ws_max_frame_size", 64 * 1024)
    if len(data) > max_bytes:
        data = data[:max_bytes]
    try:
        waveform, orig_sr = load_audio_from_bytes(data, original_sr=sr)
        processed = preprocess_audio(
            waveform, orig_sr, target_sr=settings.sample_rate,
            max_duration_sec=10.0,
        )
        model_input = audio_to_model_input(processed)
        top_predictions, _ = model_inference(model_input, top_k=settings.top_k)
        primary_label, primary_score = top_predictions[0] if top_predictions else ("unknown", 0.0)
        sound_type = audioset_label_to_sound_type(primary_label)
    except Exception as e:
        logger.exception("WS chunk inference failed")
        return {
            "request_id": request_id,
            "error": "inference_failed",
            "message": str(e),
        }
    from datetime import datetime, timezone
    return {
        "request_id": request_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "top_k": [{"label": l, "score": s} for l, s in top_predictions],
        "primary": {"label": primary_label, "score": primary_score},
        "mapping": {"sound_type": sound_type.value},
        "device_id": device_id,
    }
