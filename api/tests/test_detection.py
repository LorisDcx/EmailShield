from __future__ import annotations

import pytest

from app.models import EmailCheckRequest


@pytest.mark.asyncio()
async def test_blocklist_domain_classified_disposable(detector_and_cache):
    detector, cache = detector_and_cache
    cache.store["mx:disposable.com"] = "0"

    request = EmailCheckRequest(email="test@disposable.com")
    result = await detector.classify(request)

    assert result.classification == "disposable"
    assert "domain_blocklist" in result.reasons


@pytest.mark.asyncio()
async def test_known_domain_ok(detector_and_cache):
    detector, cache = detector_and_cache
    cache.store["mx:example.com"] = "1"

    request = EmailCheckRequest(email="hello@example.com")
    result = await detector.classify(request)

    assert result.classification == "ok"
    assert "mx_ok" in result.reasons


@pytest.mark.asyncio()
async def test_keyword_marks_suspect(detector_and_cache):
    detector, cache = detector_and_cache
    cache.store["mx:tempdomain.com"] = "1"

    request = EmailCheckRequest(email="throwaway123@tempdomain.com")
    result = await detector.classify(request)

    assert result.score >= 0.4
    assert result.classification in {"suspect", "disposable"}
    assert "keyword_match" in result.reasons
