"""Pydantic models used by the EmailShield API."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

Classification = Literal["ok", "suspect", "disposable"]


class EmailCheckRequest(BaseModel):
    email: EmailStr
    ip: Optional[str] = Field(default=None, description="Optional client IP address.")
    user_agent: Optional[str] = Field(default=None, description="Optional user agent string.")


class EmailCheckResult(BaseModel):
    email: EmailStr
    domain: str
    classification: Classification
    score: float = Field(ge=0.0, le=1.0)
    reasons: List[str]
    ttl_seconds: int = 0
    checked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    version: str = "v1"


class EmailCheckResponse(EmailCheckResult):
    pass


class BulkCheckRequest(BaseModel):
    emails: List[EmailCheckRequest]

    @field_validator("emails")
    @classmethod
    def ensure_non_empty(cls, value: List[EmailCheckRequest]) -> List[EmailCheckRequest]:
        if not value:
            raise ValueError("emails payload cannot be empty")
        return value


class BulkMetrics(BaseModel):
    total: int
    ok: int
    suspect: int
    disposable: int


class BulkCheckResponse(BaseModel):
    results: List[EmailCheckResponse]
    metrics: BulkMetrics


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    region: Optional[str] = None
