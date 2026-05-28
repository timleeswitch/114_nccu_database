"""init a orm enrollment

Revision ID: 20260528_0001
Revises:
Create Date: 2026-05-28
"""
from alembic import op
import sqlalchemy as sa


revision = "20260528_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "courses",
        sa.Column("course_id", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("credits", sa.Numeric(precision=3, scale=1), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "required",
                "core_elective",
                "general",
                "free_elective",
                "other",
                name="course_category",
            ),
            nullable=False,
        ),
        sa.Column("sub_category", sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint("course_id"),
    )
    op.create_index(op.f("ix_courses_category"), "courses", ["category"], unique=False)
    op.create_index(op.f("ix_courses_sub_category"), "courses", ["sub_category"], unique=False)

    op.create_table(
        "graduation_rules",
        sa.Column("rule_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("sub_category", sa.String(length=50), nullable=True),
        sa.Column("rule_type", sa.String(length=20), nullable=False),
        sa.Column("min_credits", sa.Integer(), nullable=True),
        sa.Column("max_credits", sa.Integer(), nullable=True),
        sa.Column("parent_rule_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["parent_rule_id"], ["graduation_rules.rule_id"]),
        sa.PrimaryKeyConstraint("rule_id"),
    )
    op.create_index(
        op.f("ix_graduation_rules_parent_rule_id"),
        "graduation_rules",
        ["parent_rule_id"],
        unique=False,
    )

    op.create_table(
        "students",
        sa.Column("student_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("student_id"),
    )

    op.create_table(
        "enrollments",
        sa.Column("enrollment_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.String(length=20), nullable=False),
        sa.Column("semester", sa.String(length=10), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.course_id"]),
        sa.ForeignKeyConstraint(["student_id"], ["students.student_id"]),
        sa.PrimaryKeyConstraint("enrollment_id"),
        sa.UniqueConstraint(
            "student_id",
            "course_id",
            "semester",
            name="uq_enrollment_student_course_semester",
        ),
    )
    op.create_index(op.f("ix_enrollments_course_id"), "enrollments", ["course_id"], unique=False)
    op.create_index(op.f("ix_enrollments_student_id"), "enrollments", ["student_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_enrollments_student_id"), table_name="enrollments")
    op.drop_index(op.f("ix_enrollments_course_id"), table_name="enrollments")
    op.drop_table("enrollments")
    op.drop_table("students")
    op.drop_index(op.f("ix_graduation_rules_parent_rule_id"), table_name="graduation_rules")
    op.drop_table("graduation_rules")
    op.drop_index(op.f("ix_courses_sub_category"), table_name="courses")
    op.drop_index(op.f("ix_courses_category"), table_name="courses")
    op.drop_table("courses")
