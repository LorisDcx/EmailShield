"""Minimal Python SDK for EmailShield."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Iterable, List, Optional

import httpx

DEFAULT_BASE_URL = os.getenv("EMAILSHIELD_API_URL", "https://api.emailshield.dev")


@dataclass
class EmailShieldResult:
    email: str
    classification: str
    score: float
    reasons: List[str]
    ttl_seconds: int


class EmailShieldClient:
    """Blocking HTTP client for EmailShield."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 5.0,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        if self.api_key:
            return {"Authorization": f"Bearer {self.api_key}"}
        return {}

    def check_email(self, email: str) -> EmailShieldResult:
        payload = {"email": email}
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/v1/check-email",
                json=payload,
                headers=self._headers(),
            )
            response.raise_for_status()
            data = response.json()
            return EmailShieldResult(
                email=data["email"],
                classification=data["classification"],
                score=data["score"],
                reasons=list(data.get("reasons", [])),
                ttl_seconds=data.get("ttl_seconds", 0),
            )

    def check_bulk(self, emails: Iterable[str]) -> List[EmailShieldResult]:
        payload = {
            "emails": [{"email": email} for email in emails],
        }
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/v1/check-bulk",
                json=payload,
                headers=self._headers(),
            )
            response.raise_for_status()
            data = response.json()
            return [
                EmailShieldResult(
                    email=item["email"],
                    classification=item["classification"],
                    score=item["score"],
                    reasons=list(item.get("reasons", [])),
                    ttl_seconds=item.get("ttl_seconds", 0),
                )
                for item in data["results"]
            ]


__all__ = ["EmailShieldClient", "EmailShieldResult"]
