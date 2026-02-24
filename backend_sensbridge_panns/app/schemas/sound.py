"""Pydantic schemas for sound API."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class TopKItem(BaseModel):
    label: str
    score: float


class PrimaryItem(BaseModel):
    label: str
    score: float


class MappingItem(BaseModel):
    sound_type: str


class PredictResponse(BaseModel):
    request_id: str
    timestamp: str
    top_k: list[TopKItem]
    primary: PrimaryItem
    mapping: MappingItem


class SoundEventOut(BaseModel):
    id: str
    type: str
    confidence: float
    label: str
    timestamp: str | None
    intensity: float | None
    source: str
    device_id: str | None


class PredictRequestMetadata(BaseModel):
    sample_rate: int | None = None
    device_id: str | None = None
