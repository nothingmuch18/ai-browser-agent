"""
Configuration and Environment Settings for AI Browser Agent.
Loads configuration from environment variables and .env file.
"""

import os
from dotenv import load_dotenv

# Load local .env file if present
load_dotenv()

class Settings:
    """Application runtime settings."""
    PROJECT_NAME: str = "AI Browser Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Google Gemini AI Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # SQLite Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agent.db")
    
    # CORS Origins
    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    
    # Environment & Logging
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # Screenshots Path
    SCREENSHOTS_DIR: str = os.getenv("SCREENSHOTS_DIR", "./screenshots")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

settings = Settings()
