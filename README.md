# EmailShield V1

EmailShield is a FastAPI-powered service that classifies email addresses as `ok`, `suspect`, or `disposable`. It is designed for SaaS builders who want to keep disposable email addresses out of their products while keeping latency, cost, and false positives low.

## Features

- `POST /v1/check-email` returns verdict, score, reasons, and suggested cache TTL.
- `POST /v1/check-bulk` processes up to 100 emails per call and returns per-verdict metrics.
- `GET /health` readiness endpoint for Railway.
- Redis-backed cache for MX lookups, usage counters, and rate-limiting.
- Blocklist loader backed by `blocklist.txt`, with keyword and entropy heuristics.
- Basic pay-as-you-go accounting via Redis (`q:count:{apikey}:{YYYYMMDD}`).

## Getting Started

### Prerequisites

- Python 3.11+
- Redis instance (local or managed)

### Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Configure environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Set `API_KEYS` to a comma-separated list of keys or leave blank for open access, and point `REDIS_URL` to your Redis instance.

### Run the API

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Open `http://127.0.0.1:8000/docs` for interactive documentation.

## Usage Examples

### Quick curl check

```bash
curl -X POST http://127.0.0.1:8000/v1/check-email \
  -H "Authorization: Bearer sk_live_example_1" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Python SDK snippet

```python
from emailshield import EmailShieldClient

client = EmailShieldClient(api_key="sk_live_example_1")
result = client.check_email("user@example.com")
print(result.classification, result.score)
```

### Node SDK snippet

```javascript
import { EmailShieldClient } from './sdk/node/index.js';

const client = new EmailShieldClient({ apiKey: 'sk_live_example_1' });
const result = await client.checkEmail('user@example.com');
console.log(result.classification, result.score);
```

## Testing

Tests rely on a fake in-memory Redis cache and do not require external services.

```bash
pytest
```

## Deployment

The repo is configured for Railway via `Railway.toml`:

- Builder: Nixpacks
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT}`
- Healthcheck: `/health`

## Blocklist refresh

Run `python scripts/refresh_blocklist.py` to update `blocklist.txt` from the open-source disposable domain list. Integrate this script into a daily cron job or GitHub Action to keep the blocklist fresh.

## Roadmap Snapshot

- Week 1: Core API, Redis cache, blocklist loader, Sentry hooks.
- Week 2: Bulk endpoint, SDKs, docs, Railway deployment.
- Week 3+: DNS optimisations, soft mode/whitelist, landing page, GTM.

See `Projet.md` for the full six-week execution plan.
