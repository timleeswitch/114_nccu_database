from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    enrollments = relationship(
        "Enrollment",
        back_populates="student",
        cascade="all, delete-orphan",
    )
