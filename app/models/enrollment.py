"""ORM model for the ``enrollment`` table (student-to-course join)."""
from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Enrollment(Base):
    """A single student-course-semester registration.

    The unique constraint on ``(student_id, course_id, semester)`` blocks
    accidental duplicate inserts of the same enrollment.

    Attributes:
        enrollment_id: Auto-increment primary key.
        student_id: Foreign key referencing ``student.student_id``.
        course_id: Foreign key referencing ``course.course_id``.
        semester: Academic term such as ``"113-1"``.
        student: Relationship back to the owning ``Student``.
        course: Relationship to the enrolled ``Course``.
    """

    __tablename__ = "enrollment"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "course_id",
            "semester",
            name="uq_student_course_semester",
        ),
    )

    enrollment_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(
        Integer, ForeignKey("student.student_id"), nullable=False, index=True
    )
    course_id = Column(
        String(20), ForeignKey("course.course_id"), nullable=False, index=True
    )
    semester = Column(String(10), nullable=False)

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
