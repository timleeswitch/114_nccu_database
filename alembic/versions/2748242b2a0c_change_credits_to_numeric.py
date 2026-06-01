"""change credits to numeric

Revision ID: 2748242b2a0c
Revises: 746a0c9d9fa3
Create Date: 2026-05-25 23:19:25.120785
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import mysql

from alembic import op

revision: str = "2748242b2a0c"
down_revision: Union[str, Sequence[str], None] = "746a0c9d9fa3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Widen ``course.credits`` from INTEGER to DECIMAL(3,1)."""
    op.alter_column(
        "course",
        "credits",
        existing_type=mysql.INTEGER(),
        type_=sa.Numeric(precision=3, scale=1),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Revert ``course.credits`` back to INTEGER."""
    op.alter_column(
        "course",
        "credits",
        existing_type=sa.Numeric(precision=3, scale=1),
        type_=mysql.INTEGER(),
        existing_nullable=False,
    )
