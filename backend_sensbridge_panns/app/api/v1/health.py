"""Health and readiness endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ml.panns_model import is_model_loaded

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """Liveness: service is running."""
    return {"status": "ok"}


@router.get("/ready")
async def ready(db: AsyncSession = Depends(get_db)) -> dict:
    """Readiness: model loaded and DB reachable."""
    model_ok = is_model_loaded()
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass
    ready_ok = model_ok and db_ok
    return {
        "status": "ready" if ready_ok else "not_ready",
        "model_loaded": model_ok,
        "database": "ok" if db_ok else "error",
    }
