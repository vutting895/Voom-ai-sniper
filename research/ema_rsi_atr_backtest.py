# -*- coding: utf-8 -*-
"""Offline GOLD M15 benchmark. Never connects to MT5 or sends orders."""
from __future__ import annotations

import argparse
import json
import math
import warnings
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
from backtesting import Backtest, Strategy


REQUIRED_COLUMNS = {"time", "open", "high", "low", "close", "spread"}
NUMERIC_COLUMNS = ("open", "high", "low", "close", "spread")
METRIC_KEYS = (
    "Return [%]",
    "Equity Final [$]",
    "Max. Drawdown [%]",
    "# Trades",
    "Win Rate [%]",
    "Profit Factor",
    "Sharpe Ratio",
)


@dataclass(frozen=True)
class ReportInputs:
    raw: pd.DataFrame
    train: pd.DataFrame
    holdout: pd.DataFrame
    cash: float
    median_spread: float
    spread_rate: float
    stats: pd.Series


def ema(values, period):
    return pd.Series(values).ewm(span=period, adjust=False).mean().to_numpy()


def atr(high, low, close, period=14):
    high_series = pd.Series(high)
    low_series = pd.Series(low)
    close_series = pd.Series(close)
    previous_close = close_series.shift(1)
    true_range = pd.concat(
        [
            high_series - low_series,
            (high_series - previous_close).abs(),
            (low_series - previous_close).abs(),
        ],
        axis=1,
    ).max(axis=1)
    return true_range.ewm(alpha=1 / period, adjust=False).mean().to_numpy()


def rsi(close, period=14):
    close_series = pd.Series(close)
    delta = close_series.diff()
    gains = delta.clip(lower=0).ewm(alpha=1 / period, adjust=False).mean()
    losses = (-delta.clip(upper=0)).ewm(alpha=1 / period, adjust=False).mean()
    relative_strength = gains / losses.replace(0, np.nan)
    return (100 - 100 / (1 + relative_strength)).fillna(50).to_numpy()


def is_valid_entry_state(atr_value, has_position):
    return not has_position and np.isfinite(atr_value) and atr_value > 0


def calculate_units(equity, risk_fraction, stop_distance):
    if stop_distance <= 0 or not np.isfinite(stop_distance):
        return 0
    return max(0, math.floor(equity * risk_fraction / stop_distance))


def is_long_entry(price, fast_ema, slow_ema, rsi_value):
    trend_aligned = fast_ema > slow_ema and price > fast_ema
    momentum_confirmed = 50 <= rsi_value <= 72
    return trend_aligned and momentum_confirmed


def is_short_entry(price, fast_ema, slow_ema, rsi_value):
    trend_aligned = fast_ema < slow_ema and price < fast_ema
    momentum_confirmed = 28 <= rsi_value <= 50
    return trend_aligned and momentum_confirmed


def classify_entry(price, fast_ema, slow_ema, rsi_value):
    if is_long_entry(price, fast_ema, slow_ema, rsi_value):
        return "long"
    if is_short_entry(price, fast_ema, slow_ema, rsi_value):
        return "short"
    return None


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
        self.atr_v = self.I(
            atr, self.data.High, self.data.Low, self.data.Close, self.atr_period
        )

    def next(self):
        if self.data.index[-1] < pd.Timestamp(self.holdout_start):
            return

        price = float(self.data.Close[-1])
        atr_value = float(self.atr_v[-1])
        if not is_valid_entry_state(atr_value, bool(self.position)):
            return

        stop_distance = atr_value * self.sl_atr
        units = calculate_units(self.equity, self.risk_fraction, stop_distance)
        if units < 1:
            return

        entry = classify_entry(
            price,
            float(self.ema_fast[-1]),
            float(self.ema_slow[-1]),
            float(self.rsi_v[-1]),
        )
        if entry == "long":
            self.buy(
                size=units,
                sl=price - stop_distance,
                tp=price + atr_value * self.tp_atr,
            )
        elif entry == "short":
            self.sell(
                size=units,
                sl=price + stop_distance,
                tp=price - atr_value * self.tp_atr,
            )


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--csv",
        required=True,
        help="Historical OHLC CSV with time,open,high,low,close,spread columns",
    )
    parser.add_argument("--output-dir", default="research-output")
    parser.add_argument(
        "--cash",
        type=float,
        default=10000.0,
        help="Normalized research equity, not live account balance",
    )
    return parser.parse_args()


def read_market_csv(csv_path):
    return pd.read_csv(csv_path)


def validate_required_columns(raw):
    missing = REQUIRED_COLUMNS.difference(raw.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {sorted(missing)}")
    return raw


def normalize_market_time(raw):
    normalized = raw.copy()
    normalized["time"] = pd.to_datetime(
        normalized["time"], utc=True, errors="coerce"
    ).dt.tz_convert(None)
    if normalized["time"].isna().any():
        raise ValueError("time column contains invalid timestamps")
    return normalized.sort_values("time").drop_duplicates("time").set_index("time")


def convert_market_numbers(raw):
    converted = raw.copy()
    for column in NUMERIC_COLUMNS:
        converted[column] = pd.to_numeric(converted[column], errors="coerce")
    return converted


def validate_market_numbers(raw):
    numeric_values = raw[list(NUMERIC_COLUMNS)]
    if numeric_values.isna().any().any():
        raise ValueError("OHLC and spread columns must contain valid numeric values")
    if not np.isfinite(numeric_values.to_numpy(dtype=float)).all():
        raise ValueError("OHLC and spread columns must contain finite values")
    return raw


def load_ohlc(csv_path):
    raw = read_market_csv(csv_path)
    raw = validate_required_columns(raw)
    raw = normalize_market_time(raw)
    raw = convert_market_numbers(raw)
    raw = validate_market_numbers(raw)
    if len(raw) < 1000:
        raise ValueError("CSV must contain at least 1000 unique time bars")
    return raw


def chronological_split(raw):
    split_index = int(len(raw) * 0.8)
    train = raw.iloc[:split_index]
    holdout = raw.iloc[split_index:]
    if len(train) < 500 or len(holdout) < 100:
        raise ValueError("Not enough data for chronological 80/20 split")
    return train, holdout


def prepare_backtest_data(raw):
    renamed = raw.rename(
        columns={
            "open": "Open",
            "high": "High",
            "low": "Low",
            "close": "Close",
            "tick_volume": "Volume",
        }
    )
    columns = ["Open", "High", "Low", "Close"]
    if "Volume" in renamed:
        columns.append("Volume")
    return renamed[columns].astype(float)


def calculate_spread_proxy(train):
    median_spread_points = float(train["spread"].median())
    median_price = float(train["close"].median())
    if not np.isfinite(median_price) or median_price <= 0:
        raise ValueError("Training median close must be a finite positive price")
    spread_rate = max(0.0, median_spread_points * 0.01 / median_price)
    return median_spread_points, spread_rate


def run_holdout_backtest(data, holdout_start, cash, spread_rate):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        backtest = Backtest(
            data,
            EMARsiAtr,
            cash=cash,
            spread=spread_rate,
            commission=0.0,
            exclusive_orders=True,
            finalize_trades=True,
        )
        return backtest.run(holdout_start=str(holdout_start))


def extract_metrics(stats):
    metrics = {}
    for key in METRIC_KEYS:
        value = stats[key]
        is_number = isinstance(value, (int, float, np.integer, np.floating))
        metrics[key] = float(value) if is_number and np.isfinite(value) else None
    return metrics


def build_report(inputs: ReportInputs):
    trades = inputs.stats["_trades"]
    report = {
        "status": "research-only; no MT5 connection and no orders sent",
        "symbol": "GOLD",
        "timeframe": "M15",
        "data_start_utc": str(inputs.raw.index.min()),
        "data_end_utc": str(inputs.raw.index.max()),
        "bars_total": int(len(inputs.raw)),
        "development_bars_80pct": int(len(inputs.train)),
        "holdout_bars_20pct": int(len(inputs.holdout)),
        "holdout_start_utc": str(inputs.holdout.index.min()),
        "holdout_end_utc": str(inputs.holdout.index.max()),
        "normalized_initial_cash": inputs.cash,
        "training_median_spread_points": inputs.median_spread,
        "fixed_spread_rate_proxy": inputs.spread_rate,
        "strategy": (
            "EMA20/EMA50 trend + RSI14 band + ATR14 SL/TP; "
            "0.25% risk fraction; whole-unit gold proxy"
        ),
        "parameters": {
            "fast_ema": 20,
            "slow_ema": 50,
            "rsi_period": 14,
            "atr_period": 14,
            "sl_atr": 2.0,
            "tp_atr": 2.0,
            "risk_fraction": 0.0025,
        },
        "metrics": extract_metrics(inputs.stats),
        "trade_rows": int(len(trades)),
        "caveats": [
            "Illustrative EMA/RSI baseline, not the production RandomForest/SMC strategy.",
            "Fixed spread proxy; variable historical spread, commissions, slippage and swaps are not modeled.",
            "Tick-level stop ordering, MT5 broker lot constraints and daily account-wide P/L guard are not modeled.",
            "Whole units are only a rough gold exposure proxy, not broker lot sizing.",
            "No parameter optimization is run on the holdout; results do not establish future profitability.",
        ],
    }
    return report, trades


def write_outputs(output_dir, report, trades):
    output_dir.mkdir(parents=True, exist_ok=True)
    report_path = output_dir / "research_report.json"
    trades_path = output_dir / "research_trades.csv"
    trades.to_csv(trades_path, index=False)
    report_path.write_text(
        json.dumps(report, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return report_path, trades_path


def main():
    args = parse_args()
    raw = load_ohlc(args.csv)
    train, holdout = chronological_split(raw)
    median_spread, spread_rate = calculate_spread_proxy(train)
    data = prepare_backtest_data(raw)
    stats = run_holdout_backtest(
        data, holdout.index.min(), args.cash, spread_rate
    )
    report_inputs = ReportInputs(
        raw=raw,
        train=train,
        holdout=holdout,
        cash=args.cash,
        median_spread=median_spread,
        spread_rate=spread_rate,
        stats=stats,
    )
    report, trades = build_report(report_inputs)
    report_path, trades_path = write_outputs(
        Path(args.output_dir), report, trades
    )
    print(json.dumps(report, indent=2, ensure_ascii=False))
    print("REPORT=" + str(report_path))
    print("TRADES=" + str(trades_path))


if __name__ == "__main__":
    main()
