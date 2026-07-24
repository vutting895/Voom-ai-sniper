from __future__ import annotations

from datetime import timedelta
from random import Random

from app.market.models import Broker, HistoricalCandle, MarketConnectionStatus, Tick, utc_now


class MarketDataProvider:
    def __init__(self, broker: Broker, mode: str) -> None:
        self.broker = broker
        self.mode = mode
        self._random = Random(f"voom-{broker}")

    def status(self) -> MarketConnectionStatus:
        return MarketConnectionStatus(
            broker=self.broker,
            connected=True,
            mode=self.mode,
            detail="Demo market-data adapter is ready; configure live credentials to connect upstream.",
        )

    def tick(self, symbol: str) -> Tick:
        base_price = self._base_price(symbol)
        spread = round(base_price * 0.0002, 5)
        drift = self._random.uniform(-0.25, 0.25)
        last = round(base_price + drift, 5)
        return Tick(
            broker=self.broker,
            symbol=symbol.upper(),
            bid=round(last - spread, 5),
            ask=round(last + spread, 5),
            last=last,
            volume=round(self._random.uniform(1, 250), 4),
            timestamp=utc_now(),
        )

    def historical(self, symbol: str, timeframe: str, limit: int) -> list[HistoricalCandle]:
        now = utc_now()
        base_price = self._base_price(symbol)
        candles: list[HistoricalCandle] = []
        for index in range(limit):
            timestamp = now - timedelta(minutes=limit - index)
            open_price = base_price + self._random.uniform(-1.5, 1.5)
            close_price = open_price + self._random.uniform(-0.8, 0.8)
            high_price = max(open_price, close_price) + self._random.uniform(0, 0.5)
            low_price = min(open_price, close_price) - self._random.uniform(0, 0.5)
            candles.append(
                HistoricalCandle(
                    broker=self.broker,
                    symbol=symbol.upper(),
                    timeframe=timeframe,
                    open=round(open_price, 5),
                    high=round(high_price, 5),
                    low=round(low_price, 5),
                    close=round(close_price, 5),
                    volume=round(self._random.uniform(10, 500), 4),
                    timestamp=timestamp,
                )
            )
        return candles

    def _base_price(self, symbol: str) -> float:
        checksum = sum(ord(character) for character in symbol.upper())
        return 50 + (checksum % 500)


class MarketDataRegistry:
    def __init__(self, mode: str) -> None:
        self.providers = {broker: MarketDataProvider(broker, mode) for broker in Broker}

    def statuses(self) -> list[MarketConnectionStatus]:
        return [provider.status() for provider in self.providers.values()]

    def get(self, broker: Broker) -> MarketDataProvider:
        return self.providers[broker]
