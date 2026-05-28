from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "course_id",
            "semester",
            name="uq_enrollment_student_course_semester",
        ),
    )

    enrollment_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False, index=True)
    course_id = Column(String(20), ForeignKey("courses.course_id"), nullable=False, index=True)
    semester = Column(String(10), nullable=False)

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
