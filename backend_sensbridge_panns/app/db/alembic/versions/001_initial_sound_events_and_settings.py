"""initial sound_events and detection_settings

Revision ID: 001
Revises:
Create Date: 2025-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "detection_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("global_threshold", sa.Float(), nullable=False),
        sa.Column("per_type_thresholds", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "sound_events",
        sa.Column("id", sa.String(36), nullable=False),
        sa.Column("type", sa.Enum("baby_cry", "fire_alarm", "siren", "doorbell", "glass_break", "unknown", name="soundtypeenum"), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("label", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("intensity", sa.Float(), nullable=True),
        sa.Column("source", sa.Enum("api", "ws", name="sourceenum"), nullable=False),
        sa.Column("device_id", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sound_events_type"), "sound_events", ["type"], unique=False)

    op.execute(
        "INSERT INTO detection_settings (id, global_threshold) VALUES (1, 0.85)"
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_sound_events_type"), table_name="sound_events")
    op.drop_table("sound_events")
    op.drop_table("detection_settings")
    op.execute("DROP TYPE IF EXISTS sourceenum")
    op.execute("DROP TYPE IF EXISTS soundtypeenum")
