"""Sound prediction, events, and settings API."""
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.db.models import SourceEnum
from app.db.session import get_db
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.sound_service import (
    predict_from_audio,
    list_events,
    get_latest_events,
    get_settings,
    update_settings,
)
from app.services.websocket_hub import register, unregister, process_audio_chunk

from app.db.models import SoundTypeEnum

logger = get_logger(__name__)

router = APIRouter(prefix="/sound", tags=["sound"])

MAX_FILE_BYTES = int(settings.max_audio_size_mb * 1024 * 1024)


async def _read_upload_with_limit(file: UploadFile, max_bytes: int = MAX_FILE_BYTES) -> bytes:
    chunks = []
    total = 0
    while True:
        chunk = await file.read(65536)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(413, f"Audio file too large (max {settings.max_audio_size_mb} MB)")
        chunks.append(chunk)
    return b"".join(chunks)


@router.post("/predict", response_model=dict)
async def predict(
    db: AsyncSession = Depends(get_db),
    file: UploadFile | None = File(None),
    audio_bytes: UploadFile | None = File(None),
    sample_rate: int | None = Form(None),
    device_id: str | None = Form(None),
):
    """
    Run sound event classification on uploaded audio.
    Provide either: file (wav/m4a/mp3) or audio_bytes (raw PCM).
    """
    if file is None and audio_bytes is None:
        raise HTTPException(400, "Provide 'file' or 'audio_bytes'")
    if file is not None and audio_bytes is not None:
        raise HTTPException(400, "Provide only one of 'file' or 'audio_bytes'")
    if sample_rate is not None and sample_rate <= 0:
        raise HTTPException(400, "sample_rate must be a positive integer when provided (e.g. 44100). Omit for file upload to use the file's sample rate.")

    try:
        if file is not None:
            data = await _read_upload_with_limit(file)
            suffix = Path(file.filename or "").suffix.lower() or ".bin"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(data)
                tmp_path = tmp.name
            try:
                out = await predict_from_audio(
                    db,
                    tmp_path,
                    is_file_path=True,
                    sample_rate=sample_rate,
                    source=SourceEnum.api,
                    device_id=device_id,
                )
            finally:
                Path(tmp_path).unlink(missing_ok=True)
        else:
            # audio_bytes uploaded as a file field (raw PCM, etc.)
            data = await _read_upload_with_limit(audio_bytes)  # type: ignore[arg-type]
            out = await predict_from_audio(
                db,
                data,
                is_file_path=False,
                sample_rate=sample_rate,
                source=SourceEnum.api,
                device_id=device_id,
            )
        return out
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Predict failed")
        detail = str(e).strip() or f"{type(e).__name__}: audio processing or model error"
        raise HTTPException(500, detail) from e


@router.get("/events", response_model=list)
async def events_list(
    db: AsyncSession = Depends(get_db),
    from_ts: datetime | None = Query(None, alias="from"),
    to_ts: datetime | None = Query(None, alias="to"),
    type_filter: SoundTypeEnum | None = Query(None, alias="type"),
    limit: int = Query(100, ge=1, le=500),
):
    """List sound events with optional time and type filters."""
    return await list_events(db, from_ts=from_ts, to_ts=to_ts, type_filter=type_filter, limit=limit)


@router.get("/events/latest", response_model=list)
async def events_latest(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(10, ge=1, le=100),
):
    """Return latest sound events."""
    return await get_latest_events(db, limit=limit)


@router.get("/settings", response_model=SettingsResponse)
async def settings_get(db: AsyncSession = Depends(get_db)):
    """Get detection settings."""
    return await get_settings(db)


@router.put("/settings", response_model=SettingsResponse)
async def settings_put(
    body: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update detection settings."""
    return await update_settings(
        db,
        global_threshold=body.global_threshold,
        per_type_thresholds=body.per_type_thresholds,
    )


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """Real-time predictions: client sends binary audio chunks or base64 JSON (text)."""
    await websocket.accept()
    await register(websocket)
    max_size = getattr(settings, "ws_max_message_size", 1024 * 1024)
    try:
        while True:
            msg = await websocket.receive()
            raw: bytes | str
            if "bytes" in msg:
                raw = msg["bytes"]
            elif "text" in msg:
                raw = msg["text"]
            else:
                continue
            size = len(raw) if isinstance(raw, bytes) else len(raw.encode())
            if size > max_size:
                await websocket.send_json({"error": "message_too_large", "max_bytes": max_size})
                continue
            result = await process_audio_chunk(raw)
            await websocket.send_json(result)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.exception("WebSocket error")
        try:
            await websocket.send_json({"error": "server_error", "message": str(e)})
        except Exception:
            pass
    finally:
        await unregister(websocket)
