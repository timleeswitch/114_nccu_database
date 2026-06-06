from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.crud import student as student_crud
from app.database import get_db
from app.schemas.student import RegisterRequest, LoginRequest, StudentResponse, TokenResponse

import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router = APIRouter()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(student_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": str(student_id),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


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
    
    hashed_password = pwd_context.hash(request.password)
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
