"""Pydantic schemas for detection settings."""
from typing import Any

from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    global_threshold: float
    per_type_thresholds: dict[str, float] | None = None


class SettingsUpdate(BaseModel):
    global_threshold: float | None = Field(None, ge=0.0, le=1.0)
    per_type_thresholds: dict[str, float] | None = None
