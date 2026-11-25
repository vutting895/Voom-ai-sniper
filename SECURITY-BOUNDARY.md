# VOOM AI Sniper — Analysis-only boundary

This repository provides trading intelligence, strategy analysis, signal screening and research outputs only.

## Hard boundary

- Broker execution is disabled in this service.
- The public `POST /api/trade` route returns HTTP 410.
- Legacy broker credential handlers are disabled.
- The former MT5 order worker is quarantined and exits immediately.
- No broker credentials, order placement, withdrawals or transfers belong in this repository.
- NOVA remains the separately governed control plane; integration must use authenticated, versioned analysis contracts.

## Local verification

```bash
npm install
npm run typecheck
npm test
npm run build
```

A successful source-level guard test is not proof of broker isolation in a deployed environment. Runtime verification and independent security review remain required.
