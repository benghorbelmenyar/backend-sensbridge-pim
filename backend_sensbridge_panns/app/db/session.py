"""Database session and engine for async and sync use."""
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from app.core.config import settings
from app.db.models import Base

_connect_args = {}
if "sqlite" in settings.database_url:
    _connect_args["check_same_thread"] = False

# Async engine and session for FastAPI
async_engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=("sqlite" not in settings.database_url),
    pool_size=5 if "sqlite" not in settings.database_url else 1,
    max_overflow=10 if "sqlite" not in settings.database_url else 0,
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Sync engine for Alembic and tests
def get_sync_engine():
    return create_engine(
        settings.database_url_sync or settings.database_url.replace("+asyncpg", ""),
        echo=False,
        pool_pre_ping=True,
    )


sync_engine = get_sync_engine()
SyncSessionLocal = sessionmaker(
    bind=sync_engine, autocommit=False, autoflush=False, expire_on_commit=False
)
