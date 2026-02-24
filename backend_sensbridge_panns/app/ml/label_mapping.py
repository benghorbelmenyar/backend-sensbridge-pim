"""Map AudioSet labels to app SoundType enum and apply thresholds."""
from app.db.models import SoundTypeEnum  # noqa: F401 re-export for callers

# AudioSet label (or substring) -> SoundType. First match wins; order matters.
AUDIOSET_TO_SOUND_TYPE: list[tuple[str, SoundTypeEnum]] = [
    ("Baby cry, infant cry", SoundTypeEnum.baby_cry),
    ("Baby cry", SoundTypeEnum.baby_cry),
    ("Infant cry", SoundTypeEnum.baby_cry),
    ("Fire alarm", SoundTypeEnum.fire_alarm),
    ("Alarm", SoundTypeEnum.fire_alarm),
    ("Siren", SoundTypeEnum.siren),
    ("Doorbell", SoundTypeEnum.doorbell),
    ("Door", SoundTypeEnum.doorbell),
    ("Glass", SoundTypeEnum.glass_break),
    ("Glass break", SoundTypeEnum.glass_break),
    ("Breaking", SoundTypeEnum.glass_break),
]

DEFAULT_SOUND_TYPE = SoundTypeEnum.unknown


def audioset_label_to_sound_type(label: str) -> SoundTypeEnum:
    """Map an AudioSet label string to SoundType."""
    label_lower = label.strip().lower()
    for keyword, st in AUDIOSET_TO_SOUND_TYPE:
        if keyword.lower() in label_lower:
            return st
    return DEFAULT_SOUND_TYPE


def get_threshold_for_type(
    sound_type: SoundTypeEnum,
    global_threshold: float,
    per_type_thresholds: dict | None,
) -> float:
    """Return threshold for a SoundType (per-type override or global)."""
    if per_type_thresholds and sound_type.value in per_type_thresholds:
        return float(per_type_thresholds[sound_type.value])
    return global_threshold
