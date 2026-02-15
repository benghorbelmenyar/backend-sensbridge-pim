"""
Whisper Transcription Service - FastAPI (GPU Optimized)
Speech-to-Text microservice for SenseBridge
Optimized for RTX 3050 Laptop GPU
"""
import os
import tempfile
import time
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from pydantic import BaseModel

load_dotenv()

# ============================================
# CONFIGURATION
# ============================================

# Model Configuration
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "medium")  # medium for best accuracy
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webm", ".flac"}


def detect_device() -> str:
  """Auto-detect best available device (CUDA if possible, else CPU)."""
  try:
    import torch  # type: ignore

    if torch.cuda.is_available():
      return "cuda"
  except Exception:
    # torch is optional; if not installed or CUDA unavailable we fall back to CPU
    pass
  return "cpu"


WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", detect_device())

# For faster-whisper, good defaults:
# - GPU: float16 (or int8_float16 for more compression)
# - CPU: int8
default_compute_type = (
  "float16" if WHISPER_DEVICE == "cuda" else "int8"
)
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", default_compute_type)

# Performance Tuning
NUM_WORKERS = int(os.getenv("NUM_WORKERS", 4))  # Parallel processing
BEAM_SIZE = int(
  os.getenv("BEAM_SIZE", "5")
)  # 1=fastest, 5=balanced, 10=best (slower)

# Global model instance
model = None
gpu_info = None


# ============================================
# GPU UTILITIES
# ============================================

def get_gpu_info() -> dict:
  """Get GPU information and memory stats (if torch + CUDA are available)."""
  try:
    import torch  # type: ignore

    if torch.cuda.is_available():
      device_name = torch.cuda.get_device_name(0)
      total_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
      allocated_memory = torch.cuda.memory_allocated(0) / 1e9
      reserved_memory = torch.cuda.memory_reserved(0) / 1e9
      free_memory = total_memory - reserved_memory

      return {
        "available": True,
        "device_name": device_name,
        "total_memory_gb": round(total_memory, 2),
        "allocated_memory_gb": round(allocated_memory, 2),
        "reserved_memory_gb": round(reserved_memory, 2),
        "free_memory_gb": round(free_memory, 2),
        "cuda_version": torch.version.cuda,
      }
  except Exception as e:
    print(f"⚠️ Could not get GPU info: {e}")

  return {
    "available": False,
    "device_name": "CPU",
    "message": "CUDA not available or torch not installed",
  }


def clear_gpu_cache() -> None:
  """Clear GPU memory cache (no-op if CUDA/torch unavailable)."""
  try:
    import torch  # type: ignore

    if torch.cuda.is_available():
      torch.cuda.empty_cache()
      print("🧹 GPU cache cleared")
  except Exception as e:
    print(f"⚠️ Could not clear GPU cache: {e}")


# ============================================
# LIFECYCLE MANAGEMENT
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
  """Load Whisper model at startup, cleanup on shutdown."""
  global model, gpu_info

  # Get GPU info
  gpu_info = get_gpu_info()

  print("\n" + "=" * 60)
  print("🚀 WHISPER SERVICE STARTUP")
  print("=" * 60)

  # Display GPU information
  if gpu_info["available"]:
    print(f"✅ GPU Detected: {gpu_info['device_name']}")
    print(f"   Total VRAM: {gpu_info['total_memory_gb']} GB")
    print(f"   Free VRAM: {gpu_info['free_memory_gb']} GB")
    print(f"   CUDA Version: {gpu_info['cuda_version']}")
  else:
    print("⚠️  GPU Not Available - Using CPU")
    print(f"   Reason: {gpu_info.get('message', 'Unknown')}")

  print("\n📦 Model Configuration:")
  print(f"   Model: {WHISPER_MODEL}")
  print(f"   Device: {WHISPER_DEVICE}")
  print(f"   Compute Type: {WHISPER_COMPUTE_TYPE}")
  print(f"   Num Workers: {NUM_WORKERS}")
  print(f"   Beam Size: {BEAM_SIZE}")

  # Load model
  print("\n🔄 Loading Whisper model...")
  start_time = time.time()

  try:
    model = WhisperModel(
      WHISPER_MODEL,
      device=WHISPER_DEVICE,
      compute_type=WHISPER_COMPUTE_TYPE,
      num_workers=NUM_WORKERS,
      download_root="./models",  # Cache models locally
    )

    load_time = time.time() - start_time
    print(f"✅ Model loaded in {load_time:.2f}s")

    # Display VRAM usage after model load (GPU only)
    if WHISPER_DEVICE == "cuda" and gpu_info["available"]:
      gpu_info = get_gpu_info()  # Refresh
      print(f"   VRAM Used: {gpu_info['allocated_memory_gb']} GB")
      print(f"   VRAM Free: {gpu_info['free_memory_gb']} GB")

    # Warm-up run (first inference is slower due to CUDA initialization)
    print("\n🔥 Running warm-up inference...")
    warmup_start = time.time()

    warmup_audio_path = create_warmup_audio()
    if warmup_audio_path:
      try:
        segments, _ = model.transcribe(
          warmup_audio_path,
          beam_size=BEAM_SIZE,
          vad_filter=True,
          language="en",
        )
        list(segments)  # consume generator

        warmup_time = time.time() - warmup_start
        print(f"✅ Warm-up completed in {warmup_time:.2f}s")

        try:
          os.unlink(warmup_audio_path)
        except OSError:
          pass
      except Exception as e:
        print(f"⚠️ Warm-up failed (not critical): {e}")

    print("\n" + "=" * 60)
    print("✅ WHISPER SERVICE READY")
    print("=" * 60 + "\n")

  except Exception as e:
    print("\n❌ FATAL: Failed to load model")
    print(f"   Error: {e}")
    print("   Possible solutions:")
    print("   1. Check if CUDA is installed: nvidia-smi")
    print(
      "   2. Install PyTorch with CUDA if you want GPU stats: "
      "pip install torch --index-url https://download.pytorch.org/whl/cu118"
    )
    print("   3. Set WHISPER_DEVICE=cpu in .env to force CPU")
    raise

  yield

  # Cleanup on shutdown
  print("\n🔄 Shutting down Whisper service...")
  if WHISPER_DEVICE == "cuda":
    clear_gpu_cache()
  # Let GC free model; CTranslate2 manages its own memory
  print("✅ Shutdown complete\n")


def create_warmup_audio() -> Optional[str]:
  """Create a short silent audio file for warm-up (optional)."""
  try:
    import numpy as np  # type: ignore
    import soundfile as sf  # type: ignore

    sample_rate = 16000
    duration = 1.0
    samples = np.zeros(int(sample_rate * duration), dtype=np.float32)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    sf.write(temp_file.name, samples, sample_rate)
    return temp_file.name
  except Exception as e:
    print(f"⚠️ Could not create warm-up audio: {e}")
    return None


# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
  title="Whisper Transcription API (GPU Optimized)",
  description="Speech-to-Text service for SenseBridge - Optimized for RTX 3050",
  version="2.0.0",
  lifespan=lifespan,
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # tighten in production
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


# ============================================
# PYDANTIC MODELS
# ============================================

class HealthResponse(BaseModel):
  status: str
  model: str
  service: str
  device: str
  compute_type: str
  gpu_info: dict


class Segment(BaseModel):
  id: int
  start: float
  end: float
  text: str


class TranscribeResponse(BaseModel):
  success: bool
  text: str
  language: str
  duration: float
  segments: list[Segment]
  processing_time: float
  model: str
  device: str


class StatsResponse(BaseModel):
  model: str
  device: str
  compute_type: str
  gpu_available: bool
  gpu_info: dict
  beam_size: int
  num_workers: int


# ============================================
# API ENDPOINTS
# ============================================

@app.get("/", response_model=HealthResponse)
async def health_check():
  """Health check endpoint with GPU status."""
  return HealthResponse(
    status="healthy",
    model=WHISPER_MODEL,
    service="Whisper Transcription API",
    device=WHISPER_DEVICE,
    compute_type=WHISPER_COMPUTE_TYPE,
    gpu_info=get_gpu_info(),
  )


@app.get("/stats", response_model=StatsResponse)
async def get_stats():
  """Get detailed service statistics."""
  current_gpu_info = get_gpu_info()
  return StatsResponse(
    model=WHISPER_MODEL,
    device=WHISPER_DEVICE,
    compute_type=WHISPER_COMPUTE_TYPE,
    gpu_available=current_gpu_info["available"],
    gpu_info=current_gpu_info,
    beam_size=BEAM_SIZE,
    num_workers=NUM_WORKERS,
  )


@app.get("/models")
async def list_models():
  """List available Whisper models with recommendations."""
  return {
    "models": {
      "tiny": {"size": "39M", "vram": "0.5GB", "speed": "very fast", "accuracy": "low"},
      "base": {"size": "74M", "vram": "0.8GB", "speed": "fast", "accuracy": "medium"},
      "small": {"size": "244M", "vram": "1.2GB", "speed": "moderate", "accuracy": "good"},
      "medium": {"size": "769M", "vram": "2.5GB", "speed": "balanced", "accuracy": "very good"},
      "large-v2": {"size": "1550M", "vram": "5GB", "speed": "slow", "accuracy": "best"},
      "large-v3": {"size": "1550M", "vram": "5GB", "speed": "slow", "accuracy": "best"},
    },
    "current": WHISPER_MODEL,
    "recommended_for_rtx3050": "medium",
    "note": "Medium model offers best balance for 4GB VRAM",
  }


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
  file: UploadFile = File(...),
  language: Optional[str] = Form(None),
  beam_size: Optional[int] = Form(None),
):
  """
  Transcribe audio file to text with GPU/CPU acceleration.

  Args:
      file: Audio file (MP3, WAV, M4A, OGG, WEBM, FLAC)
      language: 'fr' | 'en' | 'ar' | 'auto' | None
      beam_size: override default beam search size per request.
  """
  if model is None:
    raise HTTPException(status_code=503, detail="Model not loaded")

  # Validate file extension
  filename = file.filename or "audio"
  ext = os.path.splitext(filename)[1].lower()
  if ext not in ALLOWED_EXTENSIONS:
    raise HTTPException(
      status_code=400,
      detail=f"Invalid file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
    )

  # Read and validate file size
  content = await file.read()
  if len(content) > MAX_FILE_SIZE:
    raise HTTPException(
      status_code=400,
      detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024:.0f}MB",
    )

  if len(content) == 0:
    raise HTTPException(status_code=400, detail="Empty file")

  suffix = ext or ".mp3"
  tmp_path: Optional[str] = None

  try:
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
      tmp.write(content)
      tmp_path = tmp.name

    start_time = time.time()

    # Transcription options
    effective_beam = beam_size if beam_size else BEAM_SIZE
    transcribe_kwargs = {
      "beam_size": effective_beam,
      "vad_filter": True,
      "vad_parameters": {
        "min_silence_duration_ms": 500,
        "threshold": 0.5,
      },
      "temperature": 0.0,
      "best_of": 1,
      "compression_ratio_threshold": 2.4,
      "log_prob_threshold": -1.0,
      "no_speech_threshold": 0.6,
    }

    if language and language.lower() != "auto":
      lang = language.lower()
      valid_langs = ["fr", "en", "ar"]
      if lang in valid_langs:
        transcribe_kwargs["language"] = lang
      else:
        print(f"⚠️ Invalid language code '{lang}', using auto-detection")

    segments_raw, info = model.transcribe(tmp_path, **transcribe_kwargs)
    segments_list = list(segments_raw)

    processing_time = time.time() - start_time

    segments: list[Segment] = []
    for i, seg in enumerate(segments_list):
      segments.append(
        Segment(
          id=i,
          start=round(seg.start, 2),
          end=round(seg.end, 2),
          text=(seg.text or "").strip(),
        )
      )

    full_text = " ".join(s.text for s in segments).strip()
    duration = segments[-1].end if segments else 0.0
    detected_lang = getattr(info, "language", "unknown")
    rtf = processing_time / duration if duration > 0 else 0.0

    print(
      f"✅ Transcribed [{detected_lang}]: {len(full_text)} chars | "
      f"Duration: {duration:.1f}s | "
      f"Processing: {processing_time:.2f}s | "
      f"RTF: {rtf:.2f}x | "
      f"Device: {WHISPER_DEVICE}"
    )

    return TranscribeResponse(
      success=True,
      text=full_text,
      language=detected_lang,
      duration=round(duration, 2),
      segments=segments,
      processing_time=round(processing_time, 3),
      model=WHISPER_MODEL,
      device=WHISPER_DEVICE,
    )

  except Exception as e:
    print(f"❌ Transcription error: {e}")
    error_detail = str(e)
    if "CUDA out of memory" in error_detail:
      error_detail = (
        "GPU out of memory. Try: "
        "1) Use a smaller model (small instead of medium); "
        "2) Reduce beam_size to 1; "
        "3) Process shorter audio."
      )
    elif "CUDA" in error_detail and WHISPER_DEVICE == "cuda":
      error_detail = (
        f"GPU error: {e}. "
        "Try setting WHISPER_DEVICE=cpu in .env or restart the service."
      )
    raise HTTPException(status_code=500, detail=error_detail)

  finally:
    if tmp_path and os.path.exists(tmp_path):
      try:
        os.unlink(tmp_path)
      except OSError as e:
        print(f"⚠️ Could not delete temp file: {e}")


@app.post("/clear-cache")
async def clear_cache():
  """Clear GPU memory cache (admin endpoint)."""
  if WHISPER_DEVICE != "cuda":
    return {"message": "Not using GPU, no cache to clear"}
  try:
    clear_gpu_cache()
    info = get_gpu_info()
    return {"success": True, "message": "GPU cache cleared", "gpu_info": info}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
  import uvicorn

  print("\n" + "=" * 60)
  print("🎤 Whisper Transcription Service")
  print("=" * 60)
  print(f"Starting server on {HOST}:{PORT}")
  print(f"Documentation: http://{HOST}:{PORT}/docs")
  print("=" * 60 + "\n")

  uvicorn.run(
    app,
    host=HOST,
    port=PORT,
    log_level="info",
    access_log=True,
  )
