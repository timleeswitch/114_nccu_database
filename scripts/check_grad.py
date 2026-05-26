"""CLI wrapper around ``app.services.graduation_check.check_graduation``.

Lets anyone exercise the graduation check from the shell without standing
up FastAPI or writing Python::

    python -m scripts.check_grad 1                 # text summary for one student
    python -m scripts.check_grad 1 2 3             # summaries for several students
    python -m scripts.check_grad --all             # every student in the DB
    python -m scripts.check_grad 1 --json          # JSON output for backend devs
    python -m scripts.check_grad --all --json      # JSON list of every student

The DB connection comes from ``app.database.SessionLocal`` and respects the
``DATABASE_URL`` environment variable.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import Student  # noqa: E402
from app.services.graduation_check import check_graduation  # noqa: E402


def _parse_args() -> argparse.Namespace:
    """Build the argument parser and parse ``sys.argv``.

    Returns:
        The parsed ``argparse.Namespace``.
    """
    parser = argparse.ArgumentParser(
        prog="python -m scripts.check_grad",
        description=(
            "Run the graduation check for one or more students and print "
            "either a text summary or JSON."
        ),
    )
    parser.add_argument(
        "student_ids",
        nargs="*",
        type=int,
        help="One or more student IDs (omit when using --all).",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Check every student in the DB.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit a JSON array instead of the text summary.",
    )
    args = parser.parse_args()

    if args.all and args.student_ids:
        parser.error("--all cannot be combined with explicit student IDs.")
    if not args.all and not args.student_ids:
        parser.error("Provide at least one student ID or use --all.")
    return args


def main() -> None:
    """CLI entrypoint dispatched by ``python -m scripts.check_grad``."""
    args = _parse_args()
    with SessionLocal() as session:
        if args.all:
            ids = [
                s.student_id
                for s in session.query(Student).order_by(Student.student_id).all()
            ]
        else:
            ids = list(args.student_ids)

        if not ids:
            print("No students found in the DB.", file=sys.stderr)
            sys.exit(1)

        if args.json:
            reports = [
                check_graduation(sid, session=session).to_dict() for sid in ids
            ]
            print(json.dumps(reports, ensure_ascii=False, indent=2))
        else:
            for sid in ids:
                print(check_graduation(sid, session=session).summary())
                print()


if __name__ == "__main__":
    main()
