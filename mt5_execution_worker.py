import os
import sys
import time
import MetaTrader5 as mt5

def execute_mt5_order(login, password, server, symbol, action, volume, stop_loss=None, take_profit=None):
    if not mt5.initialize():
        print(f"❌ MT5 Initialize failed: {mt5.last_error()}")
        return False

    authorized = mt5.login(login=int(login), password=password, server=server)
    if not authorized:
        print(f"❌ Login failed for account {login}: {mt5.last_error()}")
        mt5.shutdown()
        return False

    print(f"✅ Connected to MT5 Account: {login} ({server})")

    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        print(f"❌ Symbol {symbol} not found")
        mt5.shutdown()
        return False

    if not symbol_info.visible:
        if not mt5.symbol_select(symbol, True):
            print(f"❌ Failed to select symbol {symbol}")
            mt5.shutdown()
            return False

    order_type = mt5.ORDER_TYPE_BUY if action.upper() == "BUY" else mt5.ORDER_TYPE_SELL
    price = mt5.symbol_info_tick(symbol).ask if action.upper() == "BUY" else mt5.symbol_info_tick(symbol).bid

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": float(volume),
        "type": order_type,
        "price": price,
        "sl": float(stop_loss) if stop_loss else 0.0,
        "tp": float(take_profit) if take_profit else 0.0,
        "deviation": 20,
        "magic": 123456,
        "comment": "Voom AI Sniper",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request)
    mt5.shutdown()

    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(f"❌ Order failed: retcode={result.retcode}, comment={result.comment}")
        return False

    print(f"🚀 Order executed successfully! Ticket: {result.order}")
    return True

if __name__ == "__main__":
    if len(sys.argv) >= 7:
        _, login, password, server, symbol, action, volume = sys.argv[:7]
        sl = sys.argv[7] if len(sys.argv) > 7 else None
        tp = sys.argv[8] if len(sys.argv) > 8 else None
        execute_mt5_order(login, password, server, symbol, action, volume, sl, tp)
