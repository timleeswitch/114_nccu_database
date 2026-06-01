"""adjust course category enum and drop min_courses

Revision ID: e8a4fcc11768
Revises: c6fccc911e91
Create Date: 2026-05-25 23:09:01.427666

Alembic autogenerate does not detect changes to MySQL ``ENUM`` values, so
the ``ALTER TABLE ... MODIFY COLUMN`` statements below are hand-written.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import mysql

from alembic import op

revision: str = "e8a4fcc11768"
down_revision: Union[str, Sequence[str], None] = "c6fccc911e91"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_ENUM = "ENUM('必修','選修','群修','一般通識','核心通識','體育','檢定')"
OLD_ENUM = "ENUM('必修','選修','通識','核心通識','體育','群修','程式設計能力檢定')"


def upgrade() -> None:
    """Drop the unused ``min_courses`` column and swap the category enum."""
    op.drop_column("graduation_rule", "min_courses")
    op.execute(f"ALTER TABLE course MODIFY COLUMN category {NEW_ENUM} NOT NULL")


def downgrade() -> None:
    """Restore the old category enum and re-add ``min_courses``."""
    op.execute(f"ALTER TABLE course MODIFY COLUMN category {OLD_ENUM} NOT NULL")
    op.add_column(
        "graduation_rule",
        sa.Column(
            "min_courses", mysql.INTEGER(), autoincrement=False, nullable=True
        ),
    )
