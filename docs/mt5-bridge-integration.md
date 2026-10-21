# MT5 Bridge and strategy-research integration

## Current architecture

- **VOOM web app**: signal presentation, charting, backtest summaries and operator controls.
- **Python Bridge on the Windows MT5 host**: the trusted final validation point for account state, spread, position limits, daily P/L limits and signal confidence.
- **MT5 EA**: execution only after the Bridge/EA contract and safety behavior have been verified on a demo account.
- **Offline research**: backtests and walk-forward experiments run separately from the live Bridge and never send orders.

Do not run an MT5 terminal or execute trades from a Vercel web/serverless function. Keep broker credentials and MT5 access on the trusted execution host.

## Local Bridge protocol observed

The current Windows Bridge listens on `127.0.0.1:8081` using a line-oriented TCP protocol (not HTTP). The verified commands are:

- `PING` → `PONG`
- `GET_PARAMS` → current parameter snapshot
- `ANALYZE` → a signal response such as `SIGNAL|dir=HOLD|conf=...|lot=...|sl=...|tp=...|reason=...`

Treat this as a deployment-specific contract, not a public API. Never expose port 8081 directly to the internet. If a web app needs access, add an authenticated HTTPS adapter on the host/network boundary, with request authentication, strict input validation, timeouts, rate limiting, audit logs and no ability to bypass risk checks. Do not send raw account credentials or broker API keys to the browser.

## Risk invariants

1. The Bridge is the final gate before an order can be considered.
2. If daily P/L, account state, spread or required market data cannot be verified, fail closed with `HOLD`.
3. Enforce daily loss, drawdown, maximum trades, maximum concurrent positions, allowed symbols and risk-per-trade server-side. UI settings are informational and must not override server guards.
4. A daily-loss guard that blocks new entries does not protect existing positions. Position-level SL/TP and emergency handling need separate verification.
5. Never treat a model score, backtest or paper-trading result as a guarantee of future performance.

## Live read-only Bridge integration (Preview only)

The current Preview can reach the Windows-host Bridge through a Cloudflare Quick Tunnel to a separate HTTP adapter bound to `127.0.0.1:8082`. The adapter itself only sends the allowlisted TCP commands `PING`, `GET_PARAMS`, and `ANALYZE` to the existing Bridge on `127.0.0.1:8081`; it exposes no order command. Every adapter request requires a high-entropy bearer token stored in a protected local file and as a sensitive Vercel Preview-only environment variable. The Vercel proxy requires same-origin POST requests and uses no-store responses.

Quick Tunnels are temporary and have no uptime guarantee. This connection is for Preview validation only; use a named Cloudflare Tunnel with managed access controls before any production use. Keep the token private and rotate it if it is exposed.

## Current web API safety status

- `/api/broker/auth` is deliberately disabled and returns HTTP 503. The UI credential inputs and lock controls are disabled. Do not enter broker API keys until per-user authentication, authorization, encrypted secret storage, and secret rotation are implemented and reviewed.
- `/api/trade` and `/api/trade/execute` fail closed with HTTP 503. They do not submit orders. The web app must not be treated as an MT5 execution client.
- The orphan root `route.ts` was removed because it was not a routable Next.js API route and contained a hard-coded default user ID and fallback encryption key.
- Build/typecheck and dependency audit were run on the PR branch: Next.js production build and TypeScript passed; pnpm audit reported zero known advisories for the current lockfile. This is not a substitute for a full application security review.

## Research workflow

1. Use the isolated `research_backtesting` workspace on the Windows host for offline experiments.
2. Split data chronologically; reserve a holdout set and do not optimize against it.
3. Include broker-relevant spread, commission, swap, slippage and position sizing before comparing strategies.
4. Compare with MT5 Strategy Tester and the Bridge's own backtest. The standalone `backtesting.py` package is AGPL-3.0; review license obligations before embedding or distributing it in a proprietary or network service.
5. Only promote a strategy after reproducible tests and demo forward testing. No research code should import the live Bridge or call order APIs.

## Remaining issues before production integration

- The default branch still needs the malformed root `package.json` repair from this PR. Do not merge until the PR is reviewed and the branch is confirmed.
- Audit the AI signal pipeline before connecting it to execution: the current helper returns only `BUY` or `WAIT` (no `SELL`) and should not be used as a complete trading decision.
- Broker auth and web-based trade execution are intentionally disabled; they are not complete product features. Implement and security-review authentication, per-user authorization, encrypted secret storage, audit logging, rate limits, and server-side risk checks before enabling them.
- The Vercel preview has passed build/typecheck and the current lockfile audit is clean. Production deployment and live trading integration have not been performed.
- This PR does not change the live MT5 EA or Python Bridge.
