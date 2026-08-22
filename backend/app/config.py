import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agent.db")
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    ]


settings = Settings()
