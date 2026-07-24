# Voom AI Sniper

Initial Turborepo monorepo foundation for Voom AI Sniper.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Web:** Next.js, TypeScript, Tailwind CSS
- **API:** FastAPI managed with Poetry, including broker-ready market data routes
- **Shared package:** TypeScript types and utilities in `packages/shared`
- **Infrastructure:** Docker Compose with web, API, PostgreSQL, and Redis
- **Market data:** MT5, Interactive Brokers, Binance, WebSocket ticks, real-time ticks, and historical candles
- **CI:** GitHub Actions lint, test, and build jobs

## Repository layout

```text
apps/
  api/      FastAPI service with Swagger/OpenAPI and /health
  web/      Next.js app on port 3000
packages/
  shared/   Shared TypeScript types and utilities
```

## Environment setup

Copy the example environment file before running services locally:

```bash
cp .env.example .env
```

The defaults are ready for Docker Compose:

- Web: <http://localhost:3000>
- API: <http://localhost:8000>
- Market brokers: <http://localhost:8000/market/brokers>
- WebSocket ticks: `ws://localhost:8000/market/ws/ticks?broker=binance&symbol=BTCUSDT`
- Swagger UI: <http://localhost:8000/docs>
- OpenAPI JSON: <http://localhost:8000/openapi.json>
- Health: <http://localhost:8000/health>

## Run with Docker Compose

```bash
docker compose up --build
```

This starts all required services:

- `web` on port `3000`
- `api` on port `8000`
- `postgres` on port `5432`
- `redis` on port `6379`

Validate the API health endpoint:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok","service":"api"}
```

## Market data and broker integration

Sprint 2 adds API foundations for the required market-data surface area:

- MT5 broker adapter (`mt5`)
- Interactive Brokers adapter (`interactive_brokers`)
- Binance crypto adapter (`binance`)
- Real-time tick endpoint: `GET /market/{broker}/ticks/{symbol}`
- Historical candle endpoint: `GET /market/{broker}/historical/{symbol}?timeframe=1m&limit=50`
- WebSocket tick stream: `WS /market/ws/ticks?broker=binance&symbol=BTCUSDT`

The default `MARKET_DATA_MODE=demo` returns deterministic demo payloads so local development, Swagger, and CI do not require live broker credentials. Configure the broker environment variables in `.env` before replacing the adapters with live upstream clients.

## Local development

Install Node dependencies:

```bash
pnpm install
```

Install API dependencies:

```bash
cd apps/api
poetry install
```

Run all development servers from the repository root:

```bash
pnpm dev
```

Run only the API:

```bash
cd apps/api
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run only the web app:

```bash
pnpm --filter @voom/web dev
```

## Quality checks

From the repository root:

```bash
pnpm lint
pnpm test
pnpm build
```

For the API:

```bash
cd apps/api
poetry run ruff check .
poetry run pytest
```

## CI

GitHub Actions runs three jobs on pull requests and pushes to `main`:

- `lint`
- `test`
- `build`
