"""Application configuration from environment."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database (default SQLite so app runs without Postgres; set DATABASE_URL for Postgres)
    database_url: str = "sqlite+aiosqlite:///./data/sensbridge_panns.db"

    # Sync URL for Alembic / sync sessions
    database_url_sync: str | None = None

    # Model
    model_dir: str | Path = Path(__file__).resolve().parents[2] / "models"
    model_filename: str = "Cnn14_mAP=0.431.pth"
    model_download_url: str = (
        "https://zenodo.org/records/3576403/files/Cnn14_mAP%3D0.431.pth?download=1"
    )

    # Inference
    sample_rate: int = 32000
    global_threshold: float = 0.85
    top_k: int = 5

    # Limits
    max_audio_size_mb: float = 10.0
    max_audio_duration_sec: float = 30.0
    request_timeout_sec: float = 60.0
    ws_max_message_size: int = 1024 * 1024  # 1 MB
    ws_max_frame_size: int = 64 * 1024  # 64 KB per frame

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Logging
    log_level: str = "INFO"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_dir = Path(self.model_dir)
        if self.database_url_sync is None:
            if "sqlite" in self.database_url:
                self.database_url_sync = self.database_url.replace(
                    "sqlite+aiosqlite", "sqlite"
                )
            else:
                self.database_url_sync = self.database_url.replace(
                    "+asyncpg", ""
                ).replace("postgresql://", "postgresql://")


settings = Settings()
