"""Seed script for courses, graduation rules, and demo students.

Usage:
    python -m scripts.seed                  # seed everything
    python -m scripts.seed --only courses   # courses only
    python -m scripts.seed --only rules     # graduation rules only
    python -m scripts.seed --only demo      # demo students + enrollments only

All inserts are idempotent (``ON DUPLICATE KEY UPDATE``), so re-running the
script is safe.
"""
from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

from sqlalchemy.dialects.mysql import insert as mysql_insert

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import (  # noqa: E402
    Course,
    CourseCategory,
    Enrollment,
    GraduationRule,
    Student,
)

CSV_PATH = PROJECT_ROOT / "data" / "seed" / "nccu_courses_111_114.csv"

# Any category value seen in the CSV that is not in this set will fail loudly.
VALID_CATEGORIES = {c.value for c in CourseCategory}


def _load_csv_rows() -> list[dict]:
    """Read the course CSV into a list of dicts.

    Uses ``utf-8-sig`` to strip the BOM emitted by Excel exports.

    Returns:
        A list of one dict per CSV row, keyed by the header columns.
    """
    with CSV_PATH.open(encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def _normalize_row(row: dict) -> dict:
    """Convert one raw CSV row into a dict ready for SQL insert.

    Args:
        row: Raw dict from ``csv.DictReader``.

    Returns:
        A dict with typed values ready for ``mysql_insert(Course)``.

    Raises:
        ValueError: If the row's ``category`` is not in ``CourseCategory``.
    """
    course_id = row["course_id"].strip()
    category = row["category"]
    if category not in VALID_CATEGORIES:
        raise ValueError(
            f"course_id={course_id} has category={category!r} "
            "which is not in CourseCategory"
        )
    return {
        "course_id": course_id,
        "name": row["name"],
        "credits": float(row["credits"]),
        "category": category,
        "sub_category": row["sub_category"] or None,
    }


GRADUATION_RULES: list[dict] = [
    # Required core courses.
    {"rule_id": 1, "category": "必修", "sub_category": None,
     "rule_type": "credit_min", "min_credits": 39, "max_credits": None,
     "parent_rule_id": None},
    # Group requirements.
    {"rule_id": 2, "category": "群修", "sub_category": "A",
     "rule_type": "credit_min", "min_credits": 6, "max_credits": None,
     "parent_rule_id": None},
    {"rule_id": 3, "category": "群修", "sub_category": "B",
     "rule_type": "credit_min", "min_credits": 3, "max_credits": None,
     "parent_rule_id": None},
    {"rule_id": 4, "category": "群修", "sub_category": "C",
     "rule_type": "credit_min", "min_credits": 3, "max_credits": None,
     "parent_rule_id": None},
    # Programming proficiency exam (pass/fail, no credits).
    {"rule_id": 5, "category": "檢定", "sub_category": None,
     "rule_type": "pass_fail", "min_credits": None, "max_credits": None,
     "parent_rule_id": None},
    # Free electives.
    {"rule_id": 6, "category": "選修", "sub_category": None,
     "rule_type": "credit_min", "min_credits": 45, "max_credits": None,
     "parent_rule_id": None},
    # General education parent (overall cap).
    {"rule_id": 7, "category": "通識", "sub_category": None,
     "rule_type": "credit_max", "min_credits": None, "max_credits": 28,
     "parent_rule_id": None},
    # General education sub-areas, all parented to rule 7.
    {"rule_id": 8, "category": "通識", "sub_category": "中文通識",
     "rule_type": "credit_range", "min_credits": 3, "max_credits": 6,
     "parent_rule_id": 7},
    {"rule_id": 9, "category": "通識", "sub_category": "外文通識",
     "rule_type": "credit_range", "min_credits": 6, "max_credits": 6,
     "parent_rule_id": 7},
    {"rule_id": 10, "category": "通識", "sub_category": "人文通識",
     "rule_type": "credit_range", "min_credits": 3, "max_credits": 7,
     "parent_rule_id": 7},
    {"rule_id": 11, "category": "通識", "sub_category": "社會通識",
     "rule_type": "credit_range", "min_credits": 3, "max_credits": 7,
     "parent_rule_id": 7},
    {"rule_id": 12, "category": "通識", "sub_category": "自然通識",
     "rule_type": "credit_range", "min_credits": 3, "max_credits": 7,
     "parent_rule_id": 7},
    {"rule_id": 13, "category": "通識", "sub_category": "書院通識",
     "rule_type": "credit_range", "min_credits": 0, "max_credits": 3,
     "parent_rule_id": 7},
    # Required PE credits.
    {"rule_id": 14, "category": "體育", "sub_category": "必修",
     "rule_type": "credit_min", "min_credits": 4, "max_credits": None,
     "parent_rule_id": None},
]


def seed_graduation_rules() -> int:
    """Upsert every row in ``GRADUATION_RULES`` into ``graduation_rule``.

    Returns:
        The number of rows submitted to the upsert (always equal to
        ``len(GRADUATION_RULES)``).
    """
    session = SessionLocal()
    try:
        stmt = mysql_insert(GraduationRule).values(GRADUATION_RULES)
        stmt = stmt.on_duplicate_key_update(
            category=stmt.inserted.category,
            sub_category=stmt.inserted.sub_category,
            rule_type=stmt.inserted.rule_type,
            min_credits=stmt.inserted.min_credits,
            max_credits=stmt.inserted.max_credits,
            parent_rule_id=stmt.inserted.parent_rule_id,
        )
        session.execute(stmt)
        session.commit()
        return len(GRADUATION_RULES)
    finally:
        session.close()


def seed_courses(batch_size: int = 500) -> int:
    """Upsert every course in the CSV into the ``course`` table.

    Args:
        batch_size: Number of rows per insert statement. Tuned to avoid
            hitting MySQL's max packet size on the full 9k-row CSV.

    Returns:
        The total number of rows submitted to the upsert.
    """
    rows = [_normalize_row(r) for r in _load_csv_rows()]
    session = SessionLocal()
    try:
        inserted = 0
        for i in range(0, len(rows), batch_size):
            chunk = rows[i : i + batch_size]
            stmt = mysql_insert(Course).values(chunk)
            stmt = stmt.on_duplicate_key_update(
                name=stmt.inserted.name,
                credits=stmt.inserted.credits,
                category=stmt.inserted.category,
                sub_category=stmt.inserted.sub_category,
            )
            session.execute(stmt)
            inserted += len(chunk)
        session.commit()
        return inserted
    finally:
        session.close()


DEMO_STUDENT_PASS_ID = 1
DEMO_STUDENT_FAIL_ID = 2


def _pick(
    session,
    category: str,
    sub: str | None = None,
    n: int | None = None,
    exclude: tuple[str, ...] = (),
    min_credits: float | None = None,
) -> list[Course]:
    """Pick courses from the DB for use in the demo seed.

    Args:
        session: An active SQLAlchemy session.
        category: ``Course.category`` value to match.
        sub: Optional ``Course.sub_category`` to match.
        n: If given, limit to the first ``n`` matching courses.
        exclude: Substrings; courses whose name contains any of these are
            skipped (used to drop excluded electives like 全民國防).
        min_credits: Optional lower bound on the credit value; useful when
            we need every picked course to be at least 3 credits.

    Returns:
        Matching ``Course`` rows in ``course_id`` ascending order.
    """
    q = session.query(Course).filter(Course.category == category)
    if sub is not None:
        q = q.filter(Course.sub_category == sub)
    for kw in exclude:
        q = q.filter(~Course.name.contains(kw))
    if min_credits is not None:
        q = q.filter(Course.credits >= min_credits)
    q = q.order_by(Course.course_id)
    return q.limit(n).all() if n else q.all()


def seed_demo_students() -> dict:
    """Create two demo students that exercise the graduation check.

    * Student ``1`` (王達標) - meets every requirement.
    * Student ``2`` (李未達) - fails multiple rules.

    Existing rows with the same ``student_id`` are deleted first so the
    script is fully re-runnable.

    Returns:
        A dict containing the enrollment counts for each demo student.
    """
    session = SessionLocal()
    try:
        # Wipe any previous demo data first to keep the script re-runnable.
        session.query(Enrollment).filter(
            Enrollment.student_id.in_(
                [DEMO_STUDENT_PASS_ID, DEMO_STUDENT_FAIL_ID]
            )
        ).delete(synchronize_session=False)
        session.query(Student).filter(
            Student.student_id.in_(
                [DEMO_STUDENT_PASS_ID, DEMO_STUDENT_FAIL_ID]
            )
        ).delete(synchronize_session=False)
        session.flush()

        s_pass = Student(
            student_id=DEMO_STUDENT_PASS_ID,
            name="王達標",
            hashed_password="$demo$",
        )
        s_fail = Student(
            student_id=DEMO_STUDENT_FAIL_ID,
            name="李未達",
            hashed_password="$demo$",
        )
        session.add_all([s_pass, s_fail])
        session.flush()

        # ----- Student 1: passes graduation -----
        pass_courses: list[Course] = []
        # Required: 13 x 3 credit core courses + 4 zero-credit labs = 39 credits.
        pass_courses += _pick(session, "必修")
        # Group A: need >= 6 credits, so pick 2 three-credit courses.
        pass_courses += _pick(session, "群修", "A", 2)
        # Group B and C: need >= 3 credits each.
        pass_courses += _pick(session, "群修", "B", 1)
        pass_courses += _pick(session, "群修", "C", 1)
        # Electives: 17 x 3 credits = 51, well above the 45 required.
        elective_pool = _pick(
            session,
            "選修",
            n=17,
            exclude=("全民國防", "軍事訓練"),
            min_credits=3.0,
        )
        pass_courses += elective_pool
        # General education: 18 (general) + 6 (core) = 24, under the cap of 28.
        pass_courses += _pick(session, "一般通識", "中文通識", 1, min_credits=3.0)
        pass_courses += _pick(session, "一般通識", "外文通識", 2, min_credits=3.0)
        pass_courses += _pick(session, "一般通識", "人文通識", 1, min_credits=3.0)
        pass_courses += _pick(session, "一般通識", "社會通識", 1, min_credits=3.0)
        pass_courses += _pick(session, "一般通識", "自然通識", 1, min_credits=3.0)
        # Core general must span at least 2 of {人文, 社會, 自然}.
        pass_courses += _pick(session, "核心通識", "人文通識", 1, min_credits=3.0)
        pass_courses += _pick(session, "核心通識", "社會通識", 1, min_credits=3.0)
        # PE: most courses are 0.5 to 1 credit, so grab 8 to be safe.
        pass_courses += _pick(session, "體育", "必修", 8)
        # Programming proficiency exam: any one enrollment satisfies pass_fail.
        pass_courses += _pick(session, "檢定", n=1)

        for c in pass_courses:
            session.add(
                Enrollment(
                    student_id=DEMO_STUDENT_PASS_ID,
                    course_id=c.course_id,
                    semester="111-1",
                )
            )

        # ----- Student 2: fails multiple rules -----
        fail_courses: list[Course] = []
        fail_courses += _pick(session, "必修", n=5)            # short on required
        fail_courses += _pick(session, "群修", "A", 1)         # short on group A
        # No group B / C.
        fail_courses += elective_pool[:5]                       # only 15 elective credits
        fail_courses += _pick(session, "一般通識", "中文通識", 1)  # missing other GE
        fail_courses += _pick(session, "體育", "必修", 1)        # not enough PE
        # No exam, no core general.

        for c in fail_courses:
            session.add(
                Enrollment(
                    student_id=DEMO_STUDENT_FAIL_ID,
                    course_id=c.course_id,
                    semester="111-1",
                )
            )

        session.commit()

        return {
            "student_pass_enrollments": session.query(Enrollment)
            .filter(Enrollment.student_id == DEMO_STUDENT_PASS_ID)
            .count(),
            "student_fail_enrollments": session.query(Enrollment)
            .filter(Enrollment.student_id == DEMO_STUDENT_FAIL_ID)
            .count(),
        }
    finally:
        session.close()


def main() -> None:
    """CLI entrypoint dispatched by ``python -m scripts.seed``."""
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--only",
        choices=["courses", "rules", "demo"],
        default=None,
        help="Seed only the chosen slice; omit to seed everything.",
    )
    args = parser.parse_args()

    if args.only in (None, "courses"):
        n = seed_courses()
        print(f"[courses] upserted {n} rows")
    if args.only in (None, "rules"):
        n = seed_graduation_rules()
        print(f"[rules] upserted {n} rows")
    if args.only in (None, "demo"):
        stats = seed_demo_students()
        print(f"[demo] {stats}")


if __name__ == "__main__":
    main()
