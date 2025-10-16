"""Configuration management for EmailShield."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    api_keys: list[str] | str | None = Field(default=None)
    redis_url: str = Field(...)
    cache_ttl_seconds: int = Field(86400)
    sentry_dsn: str | None = Field(default=None)
    region_hint: str | None = Field(default=None)
    blocklist_path: str = Field("blocklist.txt")
    mx_timeout_seconds: float = Field(1.5)
    mx_cache_ttl_seconds: int = Field(86400)
    soft_mode_score_threshold: float = Field(0.4)
    disposable_score_threshold: float = Field(0.8)
    max_bulk_batch: int = Field(100)
    rate_limit_per_second: int = Field(10)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @model_validator(mode="after")
    def normalize_api_keys(self) -> "Settings":
        value = self.api_keys
        normalized: list[str]
        if value is None:
            normalized = []
        elif isinstance(value, str):
            normalized = [item.strip() for item in value.split(",") if item.strip()]
        else:
            normalized = [str(item).strip() for item in value if str(item).strip()]
        object.__setattr__(self, "api_keys", normalized)
        return self


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    return Settings()
