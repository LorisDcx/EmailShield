"""Domain and email detection logic for EmailShield."""

from __future__ import annotations

import asyncio
import logging
import math
import pathlib
import re
from contextlib import suppress
from typing import Iterable, List, Tuple

import dns.exception
import dns.resolver
from pydantic import EmailStr

from .cache import RedisCache
from .config import Settings
from .models import Classification, EmailCheckRequest, EmailCheckResult

logger = logging.getLogger(__name__)


KEYWORD_PATTERNS: Tuple[re.Pattern[str], ...] = tuple(
    re.compile(keyword, re.IGNORECASE)
    for keyword in (
        r"temp",
        r"10min",
        r"throwaway",
        r"disposable",
        r"guerrilla",
        r"mailinator",
        r"trash",
    )
)


class EmailDetector:
    """Encapsulates blocklist loading, MX lookups, and heuristic scoring."""

    def __init__(self, settings: Settings, cache: RedisCache) -> None:
        self._settings = settings
        self._cache = cache
        self._blocklist: set[str] = set()
        self._resolver = dns.resolver.Resolver(configure=True)
        self._resolver.lifetime = settings.mx_timeout_seconds
        self._resolver.timeout = settings.mx_timeout_seconds

    async def startup(self) -> None:
        """Load initial blocklist at startup."""

        await asyncio.get_event_loop().run_in_executor(None, self._load_blocklist_from_disk)
        logger.info("Loaded %d blocklist domains", len(self._blocklist))

    def _load_blocklist_from_disk(self) -> None:
        path = pathlib.Path(self._settings.blocklist_path)
        if not path.exists():
            logger.warning("blocklist path %s not found; continuing with empty list", path)
            self._blocklist = set()
            return
        domains: List[str] = []
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                domains.append(line.lower())
        self._blocklist = set(domains)

    async def refresh_blocklist(self) -> None:
        """Public method to refresh blocklist (e.g., cron job)."""

        await asyncio.get_event_loop().run_in_executor(None, self._load_blocklist_from_disk)

    async def classify(self, request: EmailCheckRequest) -> EmailCheckResult:
        """Classify a single email."""

        email = request.email
        local_part, domain = self._split_email(email)
        score = 0.0
        reasons: List[str] = []

        if domain in self._blocklist:
            score += 0.9
            reasons.append("domain_blocklist")

        mx_ok = await self._has_mx_records(domain)
        if not mx_ok:
            score += 0.6
            reasons.append("mx_missing")
        else:
            reasons.append("mx_ok")

        keyword_match = self._match_keywords(domain, local_part)
        if keyword_match:
            score += 0.4
            reasons.append("keyword_match")

        if self._is_high_entropy(local_part):
            score += 0.2
            reasons.append("high_entropy")

        classification = self._classification_from_score(score)
        reasons = reasons or ["no_issue_detected"]

        result = EmailCheckResult(
            email=email,
            domain=domain,
            classification=classification,
            score=round(min(score, 1.0), 2),
            reasons=reasons,
            ttl_seconds=self._settings.cache_ttl_seconds,
        )
        return result

    def _classification_from_score(self, score: float) -> Classification:
        if score >= self._settings.disposable_score_threshold:
            return "disposable"
        if score >= self._settings.soft_mode_score_threshold:
            return "suspect"
        return "ok"

    def _split_email(self, email: EmailStr) -> Tuple[str, str]:
        local_part, domain = email.split("@", 1)
        return local_part.lower(), domain.lower()

    async def _has_mx_records(self, domain: str) -> bool:
        redis_key = f"mx:{domain}"
        cached = await self._cache.get(redis_key)
        if cached is not None:
            return cached == "1"

        try:
            answers = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self._resolver.resolve(domain, "MX")
            )
            has_records = bool(answers)
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.exception.DNSException) as exc:
            logger.debug("MX lookup failed for %s: %s", domain, exc)
            has_records = False

        await self._cache.set(redis_key, "1" if has_records else "0", ttl=self._settings.mx_cache_ttl_seconds)
        return has_records

    def _match_keywords(self, domain: str, local_part: str) -> bool:
        target = f"{local_part}@{domain}"
        return any(pattern.search(target) for pattern in KEYWORD_PATTERNS)

    def _is_high_entropy(self, local_part: str) -> bool:
        if len(local_part) < 10:
            return False
        entropy = self._shannon_entropy(local_part)
        return entropy >= 3.5

    def _shannon_entropy(self, text: str) -> float:
        counts = {}
        for char in text:
            counts[char] = counts.get(char, 0) + 1
        length = len(text)
        entropy = 0.0
        for count in counts.values():
            probability = count / length
            entropy -= probability * math.log2(probability)
        return entropy


def iter_chunks(iterable: Iterable[EmailCheckRequest], size: int) -> Iterable[List[EmailCheckRequest]]:
    """Yield successive chunks from an iterable."""

    chunk: List[EmailCheckRequest] = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk
