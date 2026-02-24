"""Sound prediction and event persistence service."""
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.db.models import DetectionSettings, SoundEvent, SoundTypeEnum, SourceEnum
from app.ml.label_mapping import audioset_label_to_sound_type, get_threshold_for_type
from app.ml.panns_model import inference as model_inference
from app.ml.preprocess import (
    preprocess_audio,
    load_audio_from_bytes,
    load_audio_from_file,
    audio_to_model_input,
)

logger = get_logger(__name__)


async def get_detection_settings(db: AsyncSession) -> tuple[float, dict | None]:
    """Return (global_threshold, per_type_thresholds)."""
    r = await db.execute(
        select(DetectionSettings).where(DetectionSettings.id == 1)
    )
    row = r.scalar_one_or_none()
    if row is None:
        return settings.global_threshold, None
    return row.global_threshold, row.per_type_thresholds


async def predict_from_audio(
    db: AsyncSession,
    audio: bytes | str,
    *,
    is_file_path: bool = False,
    sample_rate: int | None = None,
    top_k: int | None = None,
    source: SourceEnum = SourceEnum.api,
    device_id: str | None = None,
    persist_if_above_threshold: bool = True,
) -> dict[str, Any]:
    """
    Run PANNs inference and optionally persist SoundEvent.
    audio: either raw bytes or file path.
    """
    request_id = str(uuid.uuid4())
    top_k = top_k or settings.top_k

    if is_file_path:
        waveform, sr = load_audio_from_file(audio)
    else:
        waveform, sr = load_audio_from_bytes(audio, original_sr=sample_rate)
    processed = preprocess_audio(waveform, sr, target_sr=settings.sample_rate)
    model_input = audio_to_model_input(processed)

    top_predictions, _ = model_inference(model_input, top_k=top_k)
    primary_label, primary_score = top_predictions[0] if top_predictions else ("unknown", 0.0)
    sound_type = audioset_label_to_sound_type(primary_label)
    global_thresh, per_type = await get_detection_settings(db)
    threshold = get_threshold_for_type(sound_type, global_thresh, per_type)

    above = primary_score >= threshold
    if persist_if_above_threshold and above:
        event = SoundEvent(
            type=sound_type,
            confidence=primary_score,
            label=primary_label,
            source=source,
            device_id=device_id,
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        logger.info("SoundEvent persisted", event_id=str(event.id), type=sound_type.value)

    return {
        "request_id": request_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "top_k": [{"label": l, "score": s} for l, s in top_predictions],
        "primary": {"label": primary_label, "score": primary_score},
        "mapping": {"sound_type": sound_type.value},
    }


async def list_events(
    db: AsyncSession,
    from_ts: datetime | None = None,
    to_ts: datetime | None = None,
    type_filter: SoundTypeEnum | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """List sound_events with optional filters."""
    q = select(SoundEvent).order_by(SoundEvent.timestamp.desc()).limit(limit)
    if from_ts is not None:
        q = q.where(SoundEvent.timestamp >= from_ts)
    if to_ts is not None:
        q = q.where(SoundEvent.timestamp <= to_ts)
    if type_filter is not None:
        q = q.where(SoundEvent.type == type_filter)
    r = await db.execute(q)
    events = r.scalars().all()
    return [
        {
            "id": str(e.id),
            "type": e.type.value,
            "confidence": e.confidence,
            "label": e.label,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "intensity": e.intensity,
            "source": e.source.value,
            "device_id": e.device_id,
        }
        for e in events
    ]


async def get_latest_events(db: AsyncSession, limit: int = 10) -> list[dict[str, Any]]:
    """Return latest sound_events."""
    return await list_events(db, limit=limit)


async def get_settings(db: AsyncSession) -> dict[str, Any]:
    """Return detection_settings as dict."""
    r = await db.execute(select(DetectionSettings).where(DetectionSettings.id == 1))
    row = r.scalar_one_or_none()
    if row is None:
        return {
            "global_threshold": settings.global_threshold,
            "per_type_thresholds": None,
        }
    return {
        "global_threshold": row.global_threshold,
        "per_type_thresholds": row.per_type_thresholds,
    }


async def update_settings(
    db: AsyncSession,
    global_threshold: float | None = None,
    per_type_thresholds: dict | None = None,
) -> dict[str, Any]:
    """Update detection_settings (upsert id=1)."""
    r = await db.execute(select(DetectionSettings).where(DetectionSettings.id == 1))
    row = r.scalar_one_or_none()
    if row is None:
        row = DetectionSettings(
            id=1,
            global_threshold=global_threshold or settings.global_threshold,
            per_type_thresholds=per_type_thresholds,
        )
        db.add(row)
    else:
        if global_threshold is not None:
            row.global_threshold = global_threshold
        if per_type_thresholds is not None:
            row.per_type_thresholds = per_type_thresholds
    await db.commit()
    await db.refresh(row)
    return {
        "global_threshold": row.global_threshold,
        "per_type_thresholds": row.per_type_thresholds,
    }
