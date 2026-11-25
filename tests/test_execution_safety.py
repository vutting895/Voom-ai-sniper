import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKER_PATH = ROOT / "mt5_execution_worker.py"


class MT5ExecutionSafetyTests(unittest.TestCase):
    def test_legacy_entry_point_fails_closed_without_mt5_dependency(self):
        spec = importlib.util.spec_from_file_location("mt5_execution_worker", WORKER_PATH)
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        result = module.execute_mt5_order(
            login="demo-login",
            password="mock-password",
            server="mock-demo-server",
            symbol="XAUUSDm",
            action="BUY",
            volume=0.01,
            stop_loss=2000.0,
            take_profit=2010.0,
        )
        self.assertIs(result, False)

    def test_worker_contains_no_broker_execution_capability(self):
        source = WORKER_PATH.read_text(encoding="utf-8")
        forbidden = (
            "MetaTrader5",
            "mt5.initialize",
            "mt5.login",
            "mt5.order_send",
            "TRADE_ACTION_DEAL",
        )
        for token in forbidden:
            with self.subTest(token=token):
                self.assertNotIn(token, source)


if __name__ == "__main__":
    unittest.main()
