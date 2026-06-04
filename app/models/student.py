"""ORM model for the ``student`` table."""
from __future__ import annotations

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Student(Base):
    """A student account.

    Attributes:
        student_id: Student-entered school ID and primary key.
        name: Display name shown in the UI.
        hashed_password: Password hash; never store plaintext.
        enrollments: Backref to this student's ``Enrollment`` rows.
    """

    __tablename__ = "student"

    student_id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    enrollments = relationship("Enrollment", back_populates="student")