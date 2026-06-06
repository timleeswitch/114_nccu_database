from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_student_id
from app.crud import course as course_crud
from app.database import get_db
from app.schemas.course import CourseResponse

router = APIRouter()


@router.get("/", response_model=list[CourseResponse])
def list_courses(
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: str = Depends(get_current_student_id),  # 需要登入
):
    return course_crud.get_courses(db, category=category)


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: str,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_student_id),
):
    course = course_crud.get_course(db, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course
