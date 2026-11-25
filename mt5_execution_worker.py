"""Legacy MT5 execution entry point — intentionally disabled.

VOOM AI Sniper is a signal/research component, not a broker execution service.
All broker execution remains disabled until a separately reviewed execution
service, authentication boundary, risk policy, and release gate are approved.
"""

from __future__ import annotations


def execute_mt5_order(
    login: str,
    password: str,
    server: str,
    symbol: str,
    action: str,
    volume: float,
    stop_loss: float | None = None,
    take_profit: float | None = None,
) -> bool:
    """Compatibility shim that refuses every broker order without connecting.

    Arguments are deliberately ignored and never logged. Returning False
    preserves the legacy boolean contract while ensuring no MT5 session or
    order_send call can occur from this repository.
    """
    return False


if __name__ == "__main__":
    print("LIVE_EXECUTION_DISABLED: no broker connection or order was attempted.")
    raise SystemExit(2)
