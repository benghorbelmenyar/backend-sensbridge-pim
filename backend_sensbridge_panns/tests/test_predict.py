"""Tests for preprocessing and /v1/sound/predict."""
import io
import numpy as np
import pytest
from app.ml.preprocess import (
    preprocess_audio,
    audio_to_model_input,
    resample_mono_float32,
)
from app.ml.label_mapping import audioset_label_to_sound_type, get_threshold_for_type
from app.db.models import SoundTypeEnum


def test_preprocess_returns_correct_shape():
    """Unit test: preprocessing returns correct shape for model."""
    sr = 32000
    duration_sec = 2.0
    n_samples = int(sr * duration_sec)
    audio = np.random.randn(n_samples).astype(np.float32) * 0.5
    out = preprocess_audio(audio, sr, target_sr=32000)
    assert out.ndim == 1
    assert out.dtype == np.float32
    assert len(out) == n_samples
    batch = audio_to_model_input(out)
    assert batch.ndim == 2
    assert batch.shape[0] == 1
    assert batch.shape[1] == len(out)


def test_resample_mono_float32():
    audio = np.random.randn(16000).astype(np.float32) * 0.3
    out = resample_mono_float32(audio, 16000, 32000)
    assert out.dtype == np.float32
    assert len(out) == 32000


def test_label_mapping():
    assert audioset_label_to_sound_type("Baby cry, infant cry") == SoundTypeEnum.baby_cry
    assert audioset_label_to_sound_type("Siren") == SoundTypeEnum.siren
    assert audioset_label_to_sound_type("Fire alarm") == SoundTypeEnum.fire_alarm
    assert audioset_label_to_sound_type("Unknown label") == SoundTypeEnum.unknown
    th = get_threshold_for_type(SoundTypeEnum.baby_cry, 0.85, {"baby_cry": 0.9})
    assert th == 0.9
    th2 = get_threshold_for_type(SoundTypeEnum.siren, 0.85, {"baby_cry": 0.9})
    assert th2 == 0.85


@pytest.mark.asyncio
async def test_predict_returns_top_k_and_persists(client, small_wav_bytes):
    """Integration: POST /v1/sound/predict returns top_k and persists when above threshold."""
    r = await client.post(
        "/v1/sound/predict",
        files={"file": ("test.wav", io.BytesIO(small_wav_bytes), "audio/wav")},
    )
    assert r.status_code == 200
    data = r.json()
    assert "request_id" in data
    assert "timestamp" in data
    assert "top_k" in data
    assert len(data["top_k"]) >= 1
    assert "label" in data["top_k"][0]
    assert "score" in data["top_k"][0]
    assert "primary" in data
    assert data["primary"]["label"] == "Baby cry, infant cry"
    assert data["primary"]["score"] == 0.92
    assert data["mapping"]["sound_type"] == "baby_cry"
    # Persisted event (above threshold 0.85)
    events = await client.get("/v1/sound/events/latest?limit=5")
    assert events.status_code == 200
    latest = events.json()
    assert len(latest) >= 1
    assert latest[0]["label"] == "Baby cry, infant cry"
    assert latest[0]["confidence"] == 0.92
    assert latest[0]["type"] == "baby_cry"
