# -*- coding: utf-8 -*-
"""Offline GOLD M15 benchmark. Never connects to MT5 or sends orders."""
from pathlib import Path
import argparse, json, math, warnings
import numpy as np
import pandas as pd
from backtesting import Backtest, Strategy


def ema(a, n):
    return pd.Series(a).ewm(span=n, adjust=False).mean().to_numpy()


def atr(high, low, close, n=14):
    h, l, c = pd.Series(high), pd.Series(low), pd.Series(close)
    pc = c.shift(1)
    tr = pd.concat([h-l, (h-pc).abs(), (l-pc).abs()], axis=1).max(axis=1)
    return tr.ewm(alpha=1/n, adjust=False).mean().to_numpy()


def rsi(close, n=14):
    c = pd.Series(close)
    d = c.diff()
    gain = d.clip(lower=0).ewm(alpha=1/n, adjust=False).mean()
    loss = (-d.clip(upper=0)).ewm(alpha=1/n, adjust=False).mean().replace(0, np.nan)
    return (100 - 100/(1 + gain/loss)).fillna(50).to_numpy()


class EMARsiAtr(Strategy):
    fast = 20
    slow = 50
    rsi_period = 14
    atr_period = 14
    sl_atr = 2.0
    tp_atr = 2.0
    risk_fraction = 0.0025
    holdout_start = "2099-01-01"

    def init(self):
        self.ema_fast = self.I(ema, self.data.Close, self.fast)
        self.ema_slow = self.I(ema, self.data.Close, self.slow)
        self.rsi_v = self.I(rsi, self.data.Close, self.rsi_period)
        self.atr_v = self.I(atr, self.data.High, self.data.Low, self.data.Close, self.atr_period)

    def next(self):
        if self.data.index[-1] < pd.Timestamp(self.holdout_start):
            return
        price, av = float(self.data.Close[-1]), float(self.atr_v[-1])
        if not np.isfinite(av) or av <= 0 or self.position:
            return
        stop_dist = av * self.sl_atr
        # Approximate 1 unit as 1 ounce only for research. This is NOT broker lot sizing.
        units = math.floor(self.equity * self.risk_fraction / stop_dist)
        if units < 1:
            return
        ef, es, rv = float(self.ema_fast[-1]), float(self.ema_slow[-1]), float(self.rsi_v[-1])
        if ef > es and price > ef and 50 <= rv <= 72:
            self.buy(size=units, sl=price-stop_dist, tp=price+av*self.tp_atr)
        elif ef < es and price < ef and 28 <= rv <= 50:
            self.sell(size=units, sl=price+stop_dist, tp=price-av*self.tp_atr)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", required=True, help="Historical OHLC CSV with time,open,high,low,close,spread columns")
    parser.add_argument("--output-dir", default="research-output")
    parser.add_argument("--cash", type=float, default=10000.0, help="Normalized research equity, not live account balance")
    args = parser.parse_args()
    csv_path = Path(args.csv)
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    raw = pd.read_csv(csv_path)
    required = {"time", "open", "high", "low", "close", "spread"}
    if not required.issubset(raw.columns) or len(raw) < 1000:
        raise ValueError("CSV must contain time/open/high/low/close/spread and at least 1000 bars")
    raw["time"] = pd.to_datetime(raw["time"], utc=True).dt.tz_convert(None)
    raw = raw.sort_values("time").drop_duplicates("time").set_index("time")
    split = int(len(raw) * 0.8)
    if split < 500 or len(raw) - split < 100:
        raise ValueError("Not enough data for chronological 80/20 split")
    train, test = raw.iloc[:split], raw.iloc[split:]
    median_spread_points = float(train["spread"].median())
    median_price = float(train["close"].median())
    spread_rate = max(0.0, median_spread_points * 0.01 / median_price)
    data = raw.rename(columns={"open":"Open", "high":"High", "low":"Low", "close":"Close", "tick_volume":"Volume"})
    columns = ["Open", "High", "Low", "Close"] + (["Volume"] if "Volume" in data else [])
    data = data[columns].astype(float)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        bt = Backtest(data, EMARsiAtr, cash=args.cash, spread=spread_rate,
                      commission=0.0, exclusive_orders=True, finalize_trades=True)
        stats = bt.run(holdout_start=str(test.index.min()))
    trades = stats["_trades"]
    trades.to_csv(out_dir / "research_trades.csv", index=False)
    keys = ["Return [%]", "Equity Final [$]", "Max. Drawdown [%]", "# Trades", "Win Rate [%]", "Profit Factor", "Sharpe Ratio"]
    metrics = {}
    for key in keys:
        val = stats[key]
        metrics[key] = float(val) if isinstance(val, (int,float,np.integer,np.floating)) and np.isfinite(val) else None
    report = {
        "status": "research-only; no MT5 connection and no orders sent",
        "symbol": "GOLD", "timeframe": "M15",
        "data_start_utc": str(raw.index.min()), "data_end_utc": str(raw.index.max()),
        "bars_total": int(len(raw)), "development_bars_80pct": int(len(train)),
        "holdout_bars_20pct": int(len(test)), "holdout_start_utc": str(test.index.min()),
        "holdout_end_utc": str(test.index.max()), "normalized_initial_cash": args.cash,
        "training_median_spread_points": median_spread_points, "fixed_spread_rate_proxy": spread_rate,
        "strategy": "EMA20/EMA50 trend + RSI14 band + ATR14 SL/TP; 0.25% risk fraction; whole-unit gold proxy",
        "parameters": {"fast_ema":20,"slow_ema":50,"rsi_period":14,"atr_period":14,"sl_atr":2.0,"tp_atr":2.0,"risk_fraction":0.0025},
        "metrics": metrics, "trade_rows": int(len(trades)),
        "caveats": [
            "Illustrative EMA/RSI baseline, not the production RandomForest/SMC strategy.",
            "Fixed spread proxy; variable historical spread, commissions, slippage and swaps are not modeled.",
            "Tick-level stop ordering, MT5 broker lot constraints and daily account-wide P/L guard are not modeled.",
            "Whole units are only a rough gold exposure proxy, not broker lot sizing.",
            "No parameter optimization is run on the holdout; results do not establish future profitability."
        ]
    }
    (out_dir / "research_report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    print("REPORT=" + str(out_dir / "research_report.json"))
    print("TRADES=" + str(out_dir / "research_trades.csv"))


if __name__ == "__main__":
    main()
