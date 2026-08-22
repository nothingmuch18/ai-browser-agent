import os
from dotenv import load_dotenv
load_dotenv()
class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agent.db")
    CORS_ORIGINS: list = [os.getenv("CORS_ORIGINS", "http://localhost:3000")]
settings = Settings()
