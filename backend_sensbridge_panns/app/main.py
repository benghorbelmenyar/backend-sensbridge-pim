"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.logging import setup_logging, get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    # Create SQLite DB file and tables if using SQLite
    if "sqlite" in settings.database_url:
        from pathlib import Path
        from app.db.session import async_engine
        from app.db.models import Base
        db_path = settings.database_url.replace("sqlite+aiosqlite:///", "").split("?")[0]
        if db_path.startswith("./"):
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    # Preload model so /ready reports model_loaded=True
    try:
        from app.ml.panns_model import get_model
        get_model()
    except Exception as e:
        logger.warning("Model not loaded at startup (will load on first predict): %s", e)
    yield
    # Shutdown: close connections etc.
    pass


app = FastAPI(
    title="SenseBridge Sound Detection API",
    description="PANNs CNN14 sound event classification",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
