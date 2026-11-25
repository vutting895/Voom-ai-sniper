# VOOM AI SNIPER — isolated strategy research

This folder contains an offline benchmark harness using `backtesting.py`. It is deliberately separate from the live MT5 EA and Python Bridge.

## Run

Install the dependencies in a separate virtual environment, then supply your own exported MT5 OHLC CSV:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r research\requirements.txt
.\.venv\Scripts\python.exe research\ema_rsi_atr_backtest.py --csv C:\path\to\GOLD_M15.csv --output-dir research-output
```

CSV columns required: `time,open,high,low,close,spread`. A `tick_volume` column is optional. The tool uses the oldest 80% of the history only to estimate a fixed spread proxy, then trades only the newest 20% as a chronological holdout. It does not optimize parameters on the holdout.

## Safety and limitations

- Offline only: no MetaTrader import, account login, network bridge, or order-sending calls.
- This is an illustrative EMA/RSI/ATR baseline, not the production RandomForest/SMC signal model.
- Fixed spread proxy; commissions, slippage, swaps, tick-level fills, broker volume rules and account-wide daily loss controls are not modeled.
- Whole units are a research approximation and are not equivalent to broker lots.
- Do not promote a strategy based on this report alone. Compare with the Bridge's variable-spread simulator and MT5 Strategy Tester, then demo-forward-test.
- The live bridge's hard daily-loss limit and risk settings are not changed by this folder.

## License note

`backtesting.py` is licensed under AGPL-3.0. Review the license and its obligations before distributing or embedding the dependency in a proprietary or network-accessible service.
