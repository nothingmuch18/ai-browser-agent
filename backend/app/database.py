"""
Database layer — SQLAlchemy engine, session factory, and Base.

Uses SQLite at the path defined by settings.DATABASE_URL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# ---------------------------------------------------------------------------
# Engine & Session
# ---------------------------------------------------------------------------
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # required for SQLite
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ---------------------------------------------------------------------------
# In-memory task store (lightweight alternative to full ORM queries)
# ---------------------------------------------------------------------------
import uuid

task_store: dict[str, dict] = {}


def generate_id() -> str:
    """Return a new UUID4 string."""
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Dependency helper (for FastAPI Depends)
# ---------------------------------------------------------------------------
def get_db():
    """Yield a SQLAlchemy session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
