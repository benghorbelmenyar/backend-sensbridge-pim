"""Pytest fixtures and overrides."""
import io
import os
import sys
from collections.abc import AsyncGenerator

import numpy as np
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

# Ensure app is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.db.session import get_db
from app.db.models import Base
from app.core.config import settings


# Use in-memory SQLite for tests (sync); async SQLite for app
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
TEST_DATABASE_SYNC_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture
async def async_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(async_engine):
    async_session = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(async_engine, db_session):
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    # Mock model inference where it's used (sound_service imports it at load time)
    from app.services import sound_service
    _original_inference = sound_service.model_inference
    def mock_inference(audio, top_k=5):
        labels = ["Baby cry, infant cry", "Siren", "Doorbell", "Alarm", "Glass"]
        scores = [0.92, 0.31, 0.2, 0.15, 0.1]
        return list(zip(labels[:top_k], scores[:top_k])), np.array(scores + [0.0] * 522)
    sound_service.model_inference = mock_inference
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
    sound_service.model_inference = _original_inference


@pytest.fixture
def small_wav_bytes():
    """Minimal valid WAV (mono, 32k, 0.5 sec) for upload tests."""
    import struct
    import wave
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(32000)
        n_frames = 32000 // 2  # 0.5 sec
        w.writeframes(struct.pack(f"<{n_frames}h", *[0] * n_frames))
    return buf.getvalue()
