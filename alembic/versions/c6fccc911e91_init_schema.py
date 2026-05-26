"""init schema

Revision ID: c6fccc911e91
Revises:
Create Date: 2026-05-25 22:50:57.973975
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "c6fccc911e91"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the initial ``course``, ``graduation_rule``, ``student``, and ``enrollment`` tables."""
    op.create_table(
        "course",
        sa.Column("course_id", sa.Integer(), autoincrement=False, nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("credits", sa.Integer(), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "REQUIRED",
                "ELECTIVE",
                "GENERAL",
                "CORE_GENERAL",
                "PE",
                "GROUP",
                "PROGRAMMING_TEST",
                name="coursecategory",
            ),
            nullable=False,
        ),
        sa.Column("sub_category", sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint("course_id"),
    )
    op.create_index(op.f("ix_course_category"), "course", ["category"], unique=False)
    op.create_index(op.f("ix_course_sub_category"), "course", ["sub_category"], unique=False)
    op.create_table(
        "graduation_rule",
        sa.Column("rule_id", sa.Integer(), autoincrement=False, nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("sub_category", sa.String(length=50), nullable=True),
        sa.Column("rule_type", sa.String(length=20), nullable=False),
        sa.Column("min_credits", sa.Integer(), nullable=True),
        sa.Column("max_credits", sa.Integer(), nullable=True),
        sa.Column("min_courses", sa.Integer(), nullable=True),
        sa.Column("parent_rule_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["parent_rule_id"], ["graduation_rule.rule_id"]),
        sa.PrimaryKeyConstraint("rule_id"),
    )
    op.create_index(op.f("ix_graduation_rule_category"), "graduation_rule", ["category"], unique=False)
    op.create_index(op.f("ix_graduation_rule_sub_category"), "graduation_rule", ["sub_category"], unique=False)
    op.create_table(
        "student",
        sa.Column("student_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("student_id"),
    )
    op.create_table(
        "enrollment",
        sa.Column("enrollment_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("semester", sa.String(length=10), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["course.course_id"]),
        sa.ForeignKeyConstraint(["student_id"], ["student.student_id"]),
        sa.PrimaryKeyConstraint("enrollment_id"),
        sa.UniqueConstraint(
            "student_id", "course_id", "semester", name="uq_student_course_semester"
        ),
    )
    op.create_index(op.f("ix_enrollment_course_id"), "enrollment", ["course_id"], unique=False)
    op.create_index(op.f("ix_enrollment_student_id"), "enrollment", ["student_id"], unique=False)


def downgrade() -> None:
    """Drop every table and index created by the ``upgrade`` function."""
    op.drop_index(op.f("ix_enrollment_student_id"), table_name="enrollment")
    op.drop_index(op.f("ix_enrollment_course_id"), table_name="enrollment")
    op.drop_table("enrollment")
    op.drop_table("student")
    op.drop_index(op.f("ix_graduation_rule_sub_category"), table_name="graduation_rule")
    op.drop_index(op.f("ix_graduation_rule_category"), table_name="graduation_rule")
    op.drop_table("graduation_rule")
    op.drop_index(op.f("ix_course_sub_category"), table_name="course")
    op.drop_index(op.f("ix_course_category"), table_name="course")
    op.drop_table("course")
