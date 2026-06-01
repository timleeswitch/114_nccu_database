"""ORM model for the ``course`` table and the course-category enum."""
from __future__ import annotations

import enum

from sqlalchemy import Column, Enum, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class CourseCategory(str, enum.Enum):
    """Top-level course category used across rules and reports.

    Values intentionally stay in Chinese to match the CSV source data and
    the strings written to the ``graduation_rule`` table.
    """

    REQUIRED = "必修"
    ELECTIVE = "選修"
    GROUP = "群修"
    GENERAL = "一般通識"
    CORE_GENERAL = "核心通識"
    PE = "體育"
    EXAM = "檢定"


class Course(Base):
    """A single course offering imported from the CSV catalog.

    Attributes:
        course_id: NCCU course code; alphanumeric so it is stored as a string.
        name: Display name of the course.
        credits: Credit value with one decimal place (e.g. 0.5, 1.0, 3.0).
        category: Top-level category, restricted to ``CourseCategory`` values.
        sub_category: Optional sub-category such as ``"中文通識"`` or
            ``"A"`` for 群修; ``None`` when the category has no further split.
        enrollments: Backref to the ``Enrollment`` rows for this course.
    """

    __tablename__ = "course"

    course_id = Column(String(20), primary_key=True, autoincrement=False)
    name = Column(String(200), nullable=False)
    credits = Column(Numeric(3, 1), nullable=False)
    category = Column(
        Enum(CourseCategory, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        index=True,
    )
    sub_category = Column(String(50), nullable=True, index=True)

    enrollments = relationship("Enrollment", back_populates="course")
