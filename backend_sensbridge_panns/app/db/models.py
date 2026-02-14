"""SQLAlchemy 2.0 models for sound events and detection settings."""
import enum
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, Enum, Float, String, Text, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class SoundTypeEnum(str, enum.Enum):
    baby_cry = "baby_cry"
    fire_alarm = "fire_alarm"
    siren = "siren"
    doorbell = "doorbell"
    glass_break = "glass_break"
    unknown = "unknown"


class SourceEnum(str, enum.Enum):
    api = "api"
    ws = "ws"


class Base(DeclarativeBase):
    pass


class SoundEvent(Base):
    __tablename__ = "sound_events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    type: Mapped[SoundTypeEnum] = mapped_column(
        Enum(SoundTypeEnum), nullable=False, index=True
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    intensity: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[SourceEnum] = mapped_column(
        Enum(SourceEnum), nullable=False, default=SourceEnum.api
    )
    device_id: Mapped[str | None] = mapped_column(String(255), nullable=True)


class DetectionSettings(Base):
    __tablename__ = "detection_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    global_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0.85)
    per_type_thresholds: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True
    )
