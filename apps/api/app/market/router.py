import asyncio

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.config import settings
from app.market.models import Broker, HistoricalCandle, MarketConnectionStatus, Tick
from app.market.providers import MarketDataRegistry

router = APIRouter(prefix="/market", tags=["market-data"])
registry = MarketDataRegistry(mode=settings.market_data_mode)


@router.get("/brokers", response_model=list[MarketConnectionStatus])
def list_brokers() -> list[MarketConnectionStatus]:
    return registry.statuses()


@router.get("/{broker}/ticks/{symbol}", response_model=Tick)
def get_tick(broker: Broker, symbol: str) -> Tick:
    return registry.get(broker).tick(symbol)


@router.get("/{broker}/historical/{symbol}", response_model=list[HistoricalCandle])
def get_historical_data(
    broker: Broker,
    symbol: str,
    timeframe: str = Query(default="1m", pattern="^[0-9]+[mhd]$"),
    limit: int = Query(default=50, ge=1, le=500),
) -> list[HistoricalCandle]:
    return registry.get(broker).historical(symbol=symbol, timeframe=timeframe, limit=limit)


@router.websocket("/ws/ticks")
async def stream_ticks(websocket: WebSocket) -> None:
    await websocket.accept()
    broker = Broker(websocket.query_params.get("broker", Broker.binance))
    symbol = websocket.query_params.get("symbol", "BTCUSDT")
    interval = float(websocket.query_params.get("interval", "1"))
    provider = registry.get(broker)

    try:
        while True:
            await websocket.send_json(provider.tick(symbol).model_dump(mode="json"))
            await asyncio.sleep(interval)
    except WebSocketDisconnect:
        return
