"""Pytest fixtures for the graduation_check test suite.

Uses an in-memory SQLite engine so the suite runs without Docker / MySQL.
Every test gets a freshly built schema, an empty DB, and factories that
make it easy to construct courses, students, and enrollments inline.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable

import pytest
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from app.database import Base  # noqa: E402
from app.models import (  # noqa: E402
    Course,
    Enrollment,
    GraduationRule,
    Student,
)


@pytest.fixture
def engine() -> Engine:
    """Create an in-memory SQLite engine with the full schema applied.

    Yields:
        A SQLAlchemy ``Engine`` bound to a private SQLite DB. The engine
        is disposed when the test finishes.
    """
    eng = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture
def session(engine: Engine) -> Session:
    """Yield a fresh session bound to the in-memory DB.

    Args:
        engine: The per-test SQLite engine.

    Yields:
        A SQLAlchemy ``Session``. Closed when the test finishes.
    """
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    sess = factory()
    try:
        yield sess
    finally:
        sess.close()


@pytest.fixture
def seeded_rules(session: Session) -> list[dict]:
    """Insert the 14 production graduation rules into the test DB.

    Imports ``GRADUATION_RULES`` from ``scripts.seed`` so tests stay in
    sync with the real rule definitions.

    Args:
        session: The per-test SQLAlchemy session.

    Returns:
        The list of rule dicts that were inserted.
    """
    from scripts.seed import GRADUATION_RULES

    for row in GRADUATION_RULES:
        session.add(GraduationRule(**row))
    session.commit()
    return GRADUATION_RULES


@pytest.fixture
def make_course(session: Session) -> Callable[..., Course]:
    """Return a factory that inserts and returns a ``Course`` row.

    Args:
        session: The per-test SQLAlchemy session.

    Returns:
        A callable ``_make(category, sub_category=None, credits=3.0,
        name=None)`` that inserts a Course and returns the persisted row.
    """
    counter = {"i": 0}

    def _make(
        category: str,
        sub_category: str | None = None,
        credits: float = 3.0,
        name: str | None = None,
    ) -> Course:
        counter["i"] += 1
        course_id = f"T{counter['i']:05d}"
        course = Course(
            course_id=course_id,
            name=name or f"Course {course_id}",
            credits=credits,
            category=category,
            sub_category=sub_category,
        )
        session.add(course)
        session.flush()
        return course

    return _make


@pytest.fixture
def make_student(session: Session) -> Callable[..., Student]:
    """Return a factory that inserts and returns a ``Student`` row.

    Args:
        session: The per-test SQLAlchemy session.

    Returns:
        A callable ``_make(name="TestStudent")`` returning the new row.
    """
    counter = {"i": 0}

    def _make(name: str = "TestStudent") -> Student:
        counter["i"] += 1
        student = Student(
            student_id=counter["i"],
            name=name,
            hashed_password="$test$",
        )
        session.add(student)
        session.flush()
        return student

    return _make


@pytest.fixture
def enroll(session: Session) -> Callable[..., Enrollment]:
    """Return a factory that inserts and returns an ``Enrollment`` row.

    Args:
        session: The per-test SQLAlchemy session.

    Returns:
        A callable ``_enroll(student, course, semester="111-1")``.
    """

    def _enroll(
        student: Student, course: Course, semester: str = "111-1"
    ) -> Enrollment:
        row = Enrollment(
            student_id=student.student_id,
            course_id=course.course_id,
            semester=semester,
        )
        session.add(row)
        session.flush()
        return row

    return _enroll
