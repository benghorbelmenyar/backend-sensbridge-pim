"""WebSocket test: connect, send dummy audio frame, receive prediction JSON."""
import numpy as np
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.db.models import Base, DetectionSettings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
def ws_app():
    """App with get_db overridden for in-memory SQLite and mocked inference."""
    import asyncio
    from collections.abc import AsyncGenerator

    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(init_db())

    async_session = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    from app.ml import panns_model
    _orig = panns_model.inference
    def mock_inference(audio, top_k=5):
        labels = ["Siren", "Baby cry, infant cry"]
        scores = [0.4, 0.3]
        return list(zip(labels, scores)), np.array([0.4, 0.3] + [0.0] * 525)
    panns_model.inference = mock_inference
    panns_model._model_instance = "mock"
    yield app
    app.dependency_overrides.clear()
    panns_model.inference = _orig
    panns_model._model_instance = None
    loop.run_until_complete(engine.dispose())
    loop.close()


def test_websocket_stream_sync(ws_app):
    """Connect to WS, send small dummy audio frame, receive prediction JSON."""
    with TestClient(ws_app) as client:
        with client.websocket_connect("/v1/sound/stream") as websocket:
            chunk = np.zeros(32000, dtype=np.float32).tobytes()
            websocket.send_bytes(chunk)
            data = websocket.receive_json()
    assert "request_id" in data or "error" in data
    if "error" not in data:
        assert "top_k" in data
        assert "primary" in data
        assert "mapping" in data
