import os
from fastapi import FastAPI
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

app = FastAPI(title="114 NCCU Database Project API")

# 從環境變數讀取資料庫連線字串，如果讀不到就用預設的
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://nccu_user:nccu_password@db:3306/nccu_db")

# 建立 SQLAlchemy 資料庫引擎
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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