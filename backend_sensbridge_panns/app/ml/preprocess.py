"""Audio preprocessing for PANNs: resample to 32k, mono, float32, normalized."""
import io
from typing import Tuple

import numpy as np
import torch
import torchaudio
import torchaudio.transforms as T

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# PANNs CNN14 default: 32kHz, mono
TARGET_SR = getattr(settings, "sample_rate", 32000)


def load_audio_from_bytes(
    data: bytes,
    original_sr: int | None = None,
) -> Tuple[np.ndarray, int]:
    """Load audio from raw PCM or WAV bytes. Returns (samples, sr)."""
    try:
        # Try as WAV/encoded first
        buffer = io.BytesIO(data)
        waveform, sr = torchaudio.load(buffer)
        if waveform.shape[0] > 1:
            waveform = waveform.mean(dim=0, keepdim=True)
        waveform = waveform.numpy().flatten()
        return waveform.astype(np.float32), int(sr)
    except Exception:
        pass
    # Raw PCM: assume float32 or int16
    if len(data) % 4 == 0:
        arr = np.frombuffer(data, dtype=np.float32)
    else:
        arr = np.frombuffer(data, dtype=np.int16)
        arr = arr.astype(np.float32) / 32768.0
    sr = original_sr or TARGET_SR
    return arr, sr


def load_audio_from_file(path: str) -> Tuple[np.ndarray, int]:
    """Load audio file (wav/mp3/m4a etc); return mono float32 and sample rate."""
    path_lower = path.lower()
    # For M4A/MP3, prefer librosa (uses audioread/ffmpeg); torchaudio often lacks codec on Windows
    if path_lower.endswith(".m4a") or path_lower.endswith(".mp3") or path_lower.endswith(".aac"):
        try:
            import librosa
            data, sr = librosa.load(path, sr=None, mono=True)
            if sr <= 0:
                raise ValueError(f"Invalid sample rate from file: {sr}")
            return data.astype(np.float32), int(sr)
        except Exception as e:
            raise RuntimeError(
                "Could not load M4A/MP3 file. Install ffmpeg and ensure it is on PATH (librosa uses it for these formats)."
            ) from e
    try:
        waveform, sr = torchaudio.load(path)
    except Exception:
        try:
            import soundfile as sf
            data, sr = sf.read(path, dtype="float32")
            if data.ndim > 1:
                data = data.mean(axis=1)
            if sr <= 0:
                raise ValueError(f"Invalid sample rate from file: {sr}")
            return data.astype(np.float32), int(sr)
        except Exception:
            import librosa
            data, sr = librosa.load(path, sr=None, mono=True)
            if sr <= 0:
                raise ValueError(f"Invalid sample rate from file: {sr}")
            return data.astype(np.float32), int(sr)
    if sr <= 0:
        raise ValueError(f"Invalid sample rate from file: {sr}")
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    return waveform.numpy().flatten().astype(np.float32), int(sr)


def resample_mono_float32(
    audio: np.ndarray,
    orig_sr: int,
    target_sr: int = TARGET_SR,
) -> np.ndarray:
    """Resample to target_sr, ensure mono float32 normalized."""
    if orig_sr <= 0:
        raise ValueError(f"Invalid or missing sample rate: {orig_sr}. Audio file may be corrupted or format not fully supported.")
    if orig_sr == target_sr and audio.dtype == np.float32:
        out = np.clip(audio, -1.0, 1.0)
        return out
    t = torch.from_numpy(audio.astype(np.float32)).unsqueeze(0)
    resampler = T.Resample(orig_sr, target_sr)
    out = resampler(t).squeeze(0).numpy()
    return np.clip(out, -1.0, 1.0).astype(np.float32)


def preprocess_audio(
    audio: np.ndarray,
    sample_rate: int,
    target_sr: int = TARGET_SR,
    max_duration_sec: float | None = None,
) -> np.ndarray:
    """
    Preprocess for PANNs: mono, float32, resampled to target_sr, optionally trim.
    Returns 1D array ready for model input (batch dimension added in model).
    """
    if max_duration_sec is None:
        max_duration_sec = getattr(settings, "max_audio_duration_sec", 30.0)
    out = resample_mono_float32(audio, sample_rate, target_sr)
    max_samples = int(max_duration_sec * target_sr)
    if len(out) > max_samples:
        out = out[:max_samples]
    return out


def audio_to_model_input(audio: np.ndarray) -> np.ndarray:
    """Add batch dimension for PANNs: (1, samples)."""
    return audio[np.newaxis, :].astype(np.float32)
