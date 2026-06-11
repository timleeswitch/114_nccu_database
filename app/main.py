from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv

# Load .env before importing modules that read environment variables.
load_dotenv()

from app.api import auth
from app.api import students
from app.api import graduation
from app.api import courses
from app.api import enrollments
from app.database import engine

app = FastAPI(title="114 NCCU Database Project API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    students.router,
    prefix="/students",
    tags=["students"],
)

app.include_router(
    graduation.router,
    prefix="/graduation",
    tags=["graduation"],
)

app.include_router(
    courses.router,
    prefix="/courses",
    tags=["courses"],
)

app.include_router(
    enrollments.router,
    prefix="/enrollments",
    tags=["enrollments"],
)

@app.get("/")
def read_root():
    return {"message": "歡迎來到 114 政大資料庫期末專案 API！環境已成功運作！"}

@app.get("/db-test")
def test_db_connection():
    """測試資料庫連線是否正常的 API 端點"""
    try:
        # 嘗試對 MySQL 撈取目前時間，驗證連線
        with engine.connect() as connection:
            result = connection.execute(text("SELECT NOW();"))
            db_time = result.scalar()
        return {
            "status": "success",
            "message": "成功連線到 MySQL 資料庫！",
            "database_time": str(db_time)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": "資料庫連線失敗，請檢查 Docker 設定或 MySQL 狀態。",
            "error_detail": str(e)
        }
