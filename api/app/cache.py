"""Redis cache helpers."""

from __future__ import annotations

from typing import Any

import redis.asyncio as aioredis

from .config import Settings


class RedisCache:
    """Async Redis cache helper for storing MX and verdict data."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = aioredis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)

    @property
    def client(self) -> aioredis.Redis:
        return self._client

    async def get(self, key: str) -> str | None:
        return await self._client.get(key)

    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        await self._client.set(key, value, ex=ttl)

    async def incr(self, key: str) -> int:
        return await self._client.incr(key)

    async def expire(self, key: str, ttl: int) -> None:
        await self._client.expire(key, ttl)

    async def close(self) -> None:
        await self._client.close()
