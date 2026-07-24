from fastapi.testclient import TestClient

from app.main import app


def test_lists_supported_brokers() -> None:
    client = TestClient(app)

    response = client.get("/market/brokers")

    assert response.status_code == 200
    brokers = {item["broker"] for item in response.json()}
    assert brokers == {"mt5", "interactive_brokers", "binance"}


def test_gets_realtime_tick() -> None:
    client = TestClient(app)

    response = client.get("/market/binance/ticks/BTCUSDT")

    assert response.status_code == 200
    payload = response.json()
    assert payload["broker"] == "binance"
    assert payload["symbol"] == "BTCUSDT"
    assert payload["bid"] < payload["ask"]


def test_gets_historical_candles() -> None:
    client = TestClient(app)

    response = client.get("/market/mt5/historical/EURUSD?timeframe=1m&limit=3")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 3
    assert {candle["broker"] for candle in payload} == {"mt5"}


def test_streams_tick_websocket() -> None:
    client = TestClient(app)

    with client.websocket_connect("/market/ws/ticks?broker=binance&symbol=ETHUSDT&interval=0.01") as websocket:
        payload = websocket.receive_json()

    assert payload["broker"] == "binance"
    assert payload["symbol"] == "ETHUSDT"
