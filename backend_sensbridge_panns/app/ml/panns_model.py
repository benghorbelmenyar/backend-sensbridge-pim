"""PANNs CNN14 model loader and inference with download-on-first-run."""
import os
import shutil
import urllib.request
from pathlib import Path
from typing import Any

import numpy as np
import torch

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_model_instance: Any = None
_labels_list: list[str] | None = None


def _allowlist_torch_load_globals() -> None:
    """Allowlist pickle globals for PANNs checkpoint (PyTorch 2.6+ weights_only=True)."""
    safe = [np.ndarray, np.dtype]
    try:
        import numpy.core.multiarray as multiarray
        safe.append(multiarray._reconstruct)
    except AttributeError:
        pass
    try:
        torch.serialization.add_safe_globals(safe)
    except Exception:
        pass


# Run at import so it's set before any torch.load (e.g. when panns_inference loads the checkpoint)
_allowlist_torch_load_globals()

# panns_inference looks for labels at ~/panns_data/class_labels_indices.csv
PANNS_DATA_DIR = Path.home() / "panns_data"
PANNS_LABELS_FILENAME = "class_labels_indices.csv"
# Bundled copy shipped with the app
_BUNDLED_LABELS_PATH = Path(__file__).resolve().parent / PANNS_LABELS_FILENAME


def _ensure_panns_data_labels() -> None:
    """Ensure ~/panns_data/class_labels_indices.csv exists so panns_inference can find it."""
    target = PANNS_DATA_DIR / PANNS_LABELS_FILENAME
    if target.is_file():
        return
    PANNS_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if _BUNDLED_LABELS_PATH.is_file():
        shutil.copy2(_BUNDLED_LABELS_PATH, target)
        logger.info("Copied class_labels_indices.csv to %s", target)
    else:
        raise FileNotFoundError(
            f"Bundled labels not found at {_BUNDLED_LABELS_PATH}. "
            "Ensure app/ml/class_labels_indices.csv exists."
        )


def _ensure_model_dir() -> Path:
    p = Path(settings.model_dir)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _download_model_if_needed() -> Path:
    path = _ensure_model_dir() / settings.model_filename
    if path.is_file():
        logger.info("Model file already present", path=str(path))
        return path
    url = settings.model_download_url
    logger.info("Downloading PANNs CNN14 model from Zenodo (first run only)", url=url)
    try:
        urllib.request.urlretrieve(url, path)
        logger.info("Model downloaded successfully", path=str(path))
    except Exception as e:
        logger.exception("Model download failed")
        raise RuntimeError(f"Model download failed: {e}") from e
    return path


def _load_labels() -> list[str]:
    """Load AudioSet 527 labels from bundled CSV (avoids dependency on panns_inference path)."""
    global _labels_list
    if _labels_list is not None:
        return _labels_list
    # Prefer our bundled file so we never depend on ~/panns_data for reading
    for path in (_BUNDLED_LABELS_PATH, PANNS_DATA_DIR / PANNS_LABELS_FILENAME):
        if path.is_file():
            labels = []
            with open(path, "r", encoding="utf-8") as f:
                next(f)  # header
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) >= 3:
                        labels.append(parts[2].strip(' "'))
            if len(labels) >= 527:
                _labels_list = labels
                return _labels_list
    # Last resort
    _labels_list = ["unknown"] * 527
    return _labels_list


def get_model():
    """Lazy-load PANNs AudioTagging model (download if needed)."""
    global _model_instance
    if _model_instance is not None:
        return _model_instance
    _ensure_panns_data_labels()  # so panns_inference finds class_labels_indices.csv
    path = _download_model_if_needed()
    path_str = str(path.resolve())
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # PyTorch 2.6+ defaults to weights_only=True; PANNs checkpoint uses numpy in pickle.
    # Patch torch.load for this load only so the trusted Zenodo checkpoint can load.
    _orig_load = torch.load
    def _load_weights_only_false(*args, **kwargs):
        kwargs.setdefault("weights_only", False)
        return _orig_load(*args, **kwargs)

    try:
        torch.load = _load_weights_only_false
        from panns_inference import AudioTagging
        _model_instance = AudioTagging(checkpoint_path=path_str, device=device)
        logger.info("PANNs model loaded", device=device)
    except ImportError as e:
        raise RuntimeError(
            "panns_inference not installed. pip install panns-inference"
        ) from e
    finally:
        torch.load = _orig_load
    return _model_instance


def get_labels() -> list[str]:
    return _load_labels()


def inference(audio: np.ndarray, top_k: int = 5) -> tuple[list[tuple[str, float]], np.ndarray]:
    """
    Run PANNs inference on mono float32 audio (1D or 2D with batch=1).
    Returns (list of (label, score) for top_k, full clipwise_output array).
    """
    model = get_model()
    labels = get_labels()
    if audio.ndim == 1:
        audio = audio[np.newaxis, :].astype(np.float32)
    else:
        audio = audio.astype(np.float32)
    # Deterministic
    torch.manual_seed(42)
    clipwise_output, _ = model.inference(audio)
    if hasattr(clipwise_output, "numpy"):
        clipwise_output = clipwise_output.numpy()
    clipwise_output = np.asarray(clipwise_output).flatten()
    if len(clipwise_output) != len(labels):
        # Model may return 527; truncate or pad labels
        labels = labels[: len(clipwise_output)] if len(labels) > len(clipwise_output) else labels + ["unknown"] * (len(clipwise_output) - len(labels))
    top_indices = np.argsort(clipwise_output)[::-1][:top_k]
    result = [(labels[i], float(clipwise_output[i])) for i in top_indices]
    return result, clipwise_output


def is_model_loaded() -> bool:
    return _model_instance is not None
