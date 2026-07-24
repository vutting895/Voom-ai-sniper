from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, Field


class Broker(StrEnum):
    mt5 = "mt5"
    interactive_brokers = "interactive_brokers"
    binance = "binance"


class MarketConnectionStatus(BaseModel):
    broker: Broker
    connected: bool
    mode: str = Field(description="Connection mode, for example demo or live.")
    detail: str


class Tick(BaseModel):
    broker: Broker
    symbol: str
    bid: float
    ask: float
    last: float
    volume: float
    timestamp: datetime


class HistoricalCandle(BaseModel):
    broker: Broker
    symbol: str
    timeframe: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    timestamp: datetime


def utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)
