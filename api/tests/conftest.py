from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, Tuple

import pytest
import pytest_asyncio

from app.config import Settings, get_settings
from app.detection import EmailDetector


class FakeRedisCache:
    def __init__(self) -> None:
        self.store: Dict[str, Any] = {}
        self.counters: Dict[str, int] = defaultdict(int)

    async def get(self, key: str) -> str | None:
        value = self.store.get(key)
        if isinstance(value, str) or value is None:
            return value
        return str(value)

    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:  # noqa: ARG002
        self.store[key] = value

    async def incr(self, key: str) -> int:
        self.counters[key] += 1
        self.store[key] = str(self.counters[key])
        return self.counters[key]

    async def expire(self, key: str, ttl: int) -> None:  # noqa: ARG002
        return

    async def close(self) -> None:
        return


@pytest.fixture()
def blocklist_file(tmp_path):
    path = tmp_path / "blocklist.txt"
    path.write_text("disposable.com\n# comment\n", encoding="utf-8")
    return path


@pytest.fixture()
def settings(blocklist_file, monkeypatch) -> Settings:
    monkeypatch.setenv("BLOCKLIST_PATH", str(blocklist_file))
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    monkeypatch.setenv("API_KEYS", "sk_test")
    get_settings.cache_clear()
    return get_settings()


@pytest_asyncio.fixture()
async def detector_and_cache(settings: Settings) -> Tuple[EmailDetector, FakeRedisCache]:
    fake_cache = FakeRedisCache()
    detector = EmailDetector(settings=settings, cache=fake_cache)  # type: ignore[arg-type]
    await detector.startup()
    return detector, fake_cache


@pytest.fixture()
def client(monkeypatch, settings: Settings, detector_and_cache):
    detector, fake_cache = detector_and_cache
    monkeypatch.setenv("BLOCKLIST_PATH", settings.blocklist_path)
    monkeypatch.setenv("REDIS_URL", settings.redis_url)
    monkeypatch.setenv("API_KEYS", ",".join(settings.api_keys))
    get_settings.cache_clear()

    from app import main

    monkeypatch.setattr(main, "RedisCache", lambda _settings: fake_cache)
    monkeypatch.setattr(main, "EmailDetector", lambda settings, cache: detector)

    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as test_client:
        app.state.cache = fake_cache
        app.state.detector = detector
        yield test_client
