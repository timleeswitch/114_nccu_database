from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from sqlalchemy.orm import Session

from app.core.security import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.crud import student as student_crud
from app.database import get_db
from app.schemas.student import RegisterRequest, LoginRequest, StudentResponse, TokenResponse

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router = APIRouter()


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_student_id(token: str = Depends(_oauth2_scheme)) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        student_id = payload.get("sub")

        if student_id is None:
            raise _credentials_exception()

        return int(student_id)

    except (ValueError, TypeError):
        raise _credentials_exception()
    except Exception:
        raise _credentials_exception()


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = student_crud.get_student(db, request.student_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already exists"
        )
    
    hashed_password = get_password_hash(request.password)
    student_crud.create_student(db, request.student_id, request.name, hashed_password)
    return TokenResponse(access_token=create_access_token(request.student_id), token_type="bearer")
    

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    student = student_crud.get_student(db, request.student_id)
    if student is None or not verify_password(request.password, student.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student ID or password",
        )
    token = create_access_token(student.student_id)
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=StudentResponse)
def get_me(
    db: Session = Depends(get_db),
    student_id: int = Depends(get_current_student_id),
):
    student = student_crud.get_student(db, student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student
