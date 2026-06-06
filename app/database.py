"""SQLAlchemy engine, session factory, and declarative Base."""
from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://nccu_user:nccu_password@127.0.0.1:3307/nccu_db",
)

engine: Engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal: sessionmaker = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, future=True
)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Yield a DB session and close it when the caller is done.

    Designed for FastAPI's ``Depends`` dependency injection.

    Yields:
        A SQLAlchemy ``Session`` bound to the configured engine.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

