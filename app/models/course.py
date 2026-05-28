from sqlalchemy import Column, Enum, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String(20), primary_key=True)
    name = Column(String(200), nullable=False)
    credits = Column(Numeric(3, 1), nullable=False)
    category = Column(
        Enum(
            "required",
            "core_elective",
            "general",
            "free_elective",
            "other",
            name="course_category",
        ),
        nullable=False,
        index=True,
    )
    sub_category = Column(String(50), nullable=True, index=True)

    enrollments = relationship("Enrollment", back_populates="course")
