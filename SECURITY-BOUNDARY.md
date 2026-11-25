# VOOM AI Sniper — Analysis-only security boundary

## Purpose

Sniper is a research, signal-screening and market-analysis service. It is not a broker gateway, order router, account manager or custody service.

## Enforced source-level boundary

- `POST /api/trade` returns HTTP 410 with `SNIPER_EXECUTION_DISABLED`.
- Legacy broker credential handler `route.ts` is removed from the active branch.
- MT5 compatibility function remains import-safe and returns `False`; it does not initialize a terminal, authenticate to an account or submit orders.
- Bridge and broker UI panels are disabled and do not call broker or bridge APIs.
- The CI safety tests assert these boundaries and run with frozen pnpm dependencies.

## Integration boundary

NOVA remains a separately governed control plane. Any future Sniper-to-NOVA integration must use an authenticated, versioned analysis contract. It must not pass broker credentials or execution commands through Sniper.

## Verification and limitations

The CI suite validates source-level invariants, Python safety tests, Python research compilation, TypeScript, the Next production build and dependency audit. Passing CI is not proof of isolation in a deployed environment, broker-account ownership, tenant isolation, secret management or profitable strategy performance.

The included EMA/RSI/ATR benchmark is illustrative research code, not the production SMC/ML strategy. Its fixed spread proxy and simplified whole-unit sizing do not model full broker execution costs or lot constraints. Do not use its results to authorize live trading.

## Operational rule

Broker execution, withdrawals, transfers and live-trading capabilities remain disabled in this repository. No production deployment or broker connection is authorized by this document.
