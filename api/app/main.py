"""FastAPI application entrypoint for EmailShield."""

from __future__ import annotations

import asyncio
import logging
from collections import Counter
from typing import Annotated

import structlog
from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.responses import ORJSONResponse

from .cache import RedisCache
from .config import Settings, get_settings
from .detection import EmailDetector
from .models import (
    BulkCheckRequest,
    BulkCheckResponse,
    BulkMetrics,
    EmailCheckRequest,
    EmailCheckResponse,
    HealthResponse,
)

logger = structlog.get_logger(__name__)


def _configure_logging() -> None:
    structlog.configure(
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.add_log_level,
            structlog.processors.EventRenamer("message"),
            structlog.processors.JSONRenderer(),
        ],
    )


_configure_logging()


def get_cache(request: Request) -> RedisCache:
    return request.app.state.cache


def get_detector(request: Request) -> EmailDetector:
    return request.app.state.detector


AuthorizationHeader = Annotated[str | None, Header(convert_underscores=False)]


def require_api_key(
    authorization: AuthorizationHeader = None,
    settings: Settings = Depends(get_settings),
) -> str:
    if not settings.api_keys:
        return "anonymous"

    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing_authorization_header")
    token = authorization.replace("Bearer", "").strip()
    if token not in settings.api_keys:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_api_key")
    return token


async def enforce_rate_limit(
    api_key: str = Depends(require_api_key),
    cache: RedisCache = Depends(get_cache),
    settings: Settings = Depends(get_settings),
) -> None:
    window_seconds = 1
    limit = settings.rate_limit_per_second
    if limit <= 0:
        return
    rate_key = f"rate:{api_key}"
    current = await cache.incr(rate_key)
    if current == 1:
        await cache.expire(rate_key, window_seconds)
    if current > limit:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="rate_limited")


app = FastAPI(
    title="EmailShield API",
    version="1.0.0",
    default_response_class=ORJSONResponse,
)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("emailshield.startup")
    settings = get_settings()
    cache = RedisCache(settings)
    detector = EmailDetector(settings=settings, cache=cache)
    await detector.startup()
    app.state.cache = cache
    app.state.detector = detector
    if settings.sentry_dsn:
        try:
            import sentry_sdk

            sentry_sdk.init(settings.sentry_dsn, traces_sample_rate=0.1)
            logger.info("emailshield.sentry_initialized")
        except Exception as exc:  # pragma: no cover
            logger.warning("emailshield.sentry_init_failed", error=str(exc))


@app.on_event("shutdown")
async def on_shutdown() -> None:
    cache: RedisCache | None = getattr(app.state, "cache", None)
    if cache:
        await cache.close()
    logger.info("emailshield.shutdown")


async def increment_usage(cache: RedisCache, api_key: str) -> None:
    from datetime import datetime, timezone

    date_key = datetime.now(timezone.utc).strftime("%Y%m%d")
    usage_key = f"q:count:{api_key}:{date_key}"
    current = await cache.incr(usage_key)
    if current == 1:
        await cache.expire(usage_key, 86400)


@app.post(
    "/v1/check-email",
    response_model=EmailCheckResponse,
    dependencies=[Depends(enforce_rate_limit)],
)
async def check_email(
    payload: EmailCheckRequest,
    api_key: str = Depends(require_api_key),
    detector: EmailDetector = Depends(get_detector),
    cache: RedisCache = Depends(get_cache),
) -> EmailCheckResponse:
    result = await detector.classify(payload)
    await increment_usage(cache, api_key)
    return EmailCheckResponse(**result.dict())


@app.post(
    "/v1/check-bulk",
    response_model=BulkCheckResponse,
    dependencies=[Depends(enforce_rate_limit)],
)
async def check_bulk(
    payload: BulkCheckRequest,
    api_key: str = Depends(require_api_key),
    detector: EmailDetector = Depends(get_detector),
    settings: Settings = Depends(get_settings),
    cache: RedisCache = Depends(get_cache),
) -> BulkCheckResponse:
    if len(payload.emails) > settings.max_bulk_batch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"batch size exceeds {settings.max_bulk_batch}",
        )
    tasks = [detector.classify(request) for request in payload.emails]
    results = await asyncio.gather(*tasks)

    metrics_counter = Counter(result.classification for result in results)
    metrics = BulkMetrics(
        total=len(results),
        ok=metrics_counter.get("ok", 0),
        suspect=metrics_counter.get("suspect", 0),
        disposable=metrics_counter.get("disposable", 0),
    )
    await increment_usage(cache, api_key)
    return BulkCheckResponse(
        results=[EmailCheckResponse(**result.dict()) for result in results],
        metrics=metrics,
    )


@app.get("/health", response_model=HealthResponse, include_in_schema=False)
async def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(status="ok", region=settings.region_hint)
