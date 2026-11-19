import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    keitaro_url: str
    keitaro_api_key: str
    database_url: str
    cors_origins: tuple[str, ...]


def get_settings() -> Settings:
    cors_origins = tuple(
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    )
    return Settings(
        keitaro_url=os.getenv("KEITARO_URL", "").strip(),
        keitaro_api_key=os.getenv("KEITARO_API_KEY", "").strip(),
        database_url=os.getenv("DATABASE_URL", "sqlite:///./keitaro_wrapper.db"),
        cors_origins=cors_origins,
    )
