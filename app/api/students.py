from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_student_id
from app.crud import student as student_crud
from app.database import get_db
from app.schemas.student import StudentResponse

router = APIRouter()


@router.get("/me", response_model=StudentResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    student_id: int = Depends(get_current_student_id),
):
    student = student_crud.get_student(db, student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student