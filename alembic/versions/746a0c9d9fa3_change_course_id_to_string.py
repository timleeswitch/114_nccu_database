"""change course_id to string

Revision ID: 746a0c9d9fa3
Revises: e8a4fcc11768
Create Date: 2026-05-25 23:17:25.636306

MySQL refuses to alter a column referenced by a foreign key, so the
``enrollment.course_id`` FK is dropped before the column type change and
recreated afterwards.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import mysql

from alembic import op

revision: str = "746a0c9d9fa3"
down_revision: Union[str, Sequence[str], None] = "e8a4fcc11768"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FK_NAME = "enrollment_ibfk_1"


def upgrade() -> None:
    """Change both ``course.course_id`` and ``enrollment.course_id`` to VARCHAR(20)."""
    op.drop_constraint(FK_NAME, "enrollment", type_="foreignkey")
    op.alter_column(
        "course",
        "course_id",
        existing_type=mysql.INTEGER(),
        type_=sa.String(length=20),
        existing_nullable=False,
        autoincrement=False,
    )
    op.alter_column(
        "enrollment",
        "course_id",
        existing_type=mysql.INTEGER(),
        type_=sa.String(length=20),
        existing_nullable=False,
    )
    op.create_foreign_key(
        FK_NAME, "enrollment", "course", ["course_id"], ["course_id"]
    )


def downgrade() -> None:
    """Revert ``course_id`` columns back to INTEGER."""
    op.drop_constraint(FK_NAME, "enrollment", type_="foreignkey")
    op.alter_column(
        "enrollment",
        "course_id",
        existing_type=sa.String(length=20),
        type_=mysql.INTEGER(),
        existing_nullable=False,
    )
    op.alter_column(
        "course",
        "course_id",
        existing_type=sa.String(length=20),
        type_=mysql.INTEGER(),
        existing_nullable=False,
        autoincrement=False,
    )
    op.create_foreign_key(
        FK_NAME, "enrollment", "course", ["course_id"], ["course_id"]
    )
