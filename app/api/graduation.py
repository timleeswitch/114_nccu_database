from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.auth import get_current_student_id
from app.crud import enrollment as enrollment_crud
from app.crud import graduation_rule as graduation_rule_crud
from app.database import get_db
from app.schemas.graduation import GraduationCheckResponse, GraduationSummaryItem

router = APIRouter()


@router.get("/check", response_model=GraduationCheckResponse)
def check_graduation(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id),
):
    rules = graduation_rule_crud.get_graduation_rules(db)
    enrollments = enrollment_crud.get_enrollments_by_student(db, student_id)

    # 計算每個 (category, sub_category) 已修學分
    completed: dict[tuple[str, str | None], Decimal] = {}
    for enrollment in enrollments:
        course = enrollment.course
        key = (course.category, course.sub_category)
        completed[key] = completed.get(key, Decimal(0)) + course.credits

    summary: list[GraduationSummaryItem] = []
    is_eligible = True

    for rule in rules:
        # 只處理有 min_credits 的 rule（有畢業門檻的）
        if rule.min_credits is None:
            continue

        key = (rule.category, rule.sub_category)
        earned = completed.get(key, Decimal(0))
        required = rule.min_credits
        remaining = max(Decimal(0), required - earned)

        if remaining > 0:
            is_eligible = False

        summary.append(
            GraduationSummaryItem(
                category=rule.category,
                sub_category=rule.sub_category,
                required=required,
                completed=int(earned),
                remaining=remaining,
            )
        )

    return GraduationCheckResponse(is_eligible=is_eligible, summary=summary)