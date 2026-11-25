import csv
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

RESEARCH_DIR = Path(__file__).resolve().parents[1] / "research"
sys.path.insert(0, str(RESEARCH_DIR))

import ema_rsi_atr_backtest as research  # noqa: E402


class ResearchDataAndSignalTests(unittest.TestCase):
    def write_csv(self, rows):
        temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(temp_dir.cleanup)
        csv_path = Path(temp_dir.name) / "market.csv"
        with csv_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["time", "open", "high", "low", "close", "spread", "tick_volume"])
            writer.writerows(rows)
        return csv_path

    @staticmethod
    def market_rows(count=1001):
        start = datetime(2024, 1, 1, tzinfo=timezone.utc)
        rows = []
        for index in range(count):
            close = 2000.0 + index * 0.01
            timestamp = start + timedelta(minutes=15 * index)
            rows.append([
                timestamp.isoformat(),
                close - 0.1,
                close + 0.2,
                close - 0.2,
                close,
                20,
                100 + index,
            ])
        return rows

    def test_load_ohlc_sorts_deduplicates_and_normalizes_utc(self):
        rows = self.market_rows()
        rows[0], rows[1] = rows[1], rows[0]
        rows.append(rows[-1])
        loaded = research.load_ohlc(self.write_csv(rows))
        self.assertEqual(len(loaded), 1001)
        self.assertTrue(loaded.index.is_monotonic_increasing)
        self.assertIsNone(loaded.index.tz)

    def test_load_ohlc_rejects_missing_columns(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.csv"
            path.write_text("time,open,high,low,close\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "missing required columns"):
                research.load_ohlc(path)

    def test_load_ohlc_rejects_invalid_timestamp_and_numeric_values(self):
        rows = self.market_rows()
        rows[0][0] = "not-a-timestamp"
        with self.assertRaisesRegex(ValueError, "invalid timestamps"):
            research.load_ohlc(self.write_csv(rows))

        rows = self.market_rows()
        rows[0][1] = "not-a-price"
        with self.assertRaisesRegex(ValueError, "valid numeric values"):
            research.load_ohlc(self.write_csv(rows))

    def test_chronological_split_keeps_newest_fifth_as_holdout(self):
        loaded = research.load_ohlc(self.write_csv(self.market_rows()))
        train, holdout = research.chronological_split(loaded)
        self.assertEqual(len(train), 800)
        self.assertEqual(len(holdout), 201)
        self.assertLess(train.index.max(), holdout.index.min())

    def test_entry_classifier_covers_long_short_and_neutral(self):
        self.assertEqual(research.classify_entry(101, 100, 99, 60), "long")
        self.assertEqual(research.classify_entry(98, 99, 100, 40), "short")
        self.assertIsNone(research.classify_entry(100, 100, 99, 75))

    def test_spread_proxy_uses_training_data_and_returns_nonnegative_rate(self):
        loaded = research.load_ohlc(self.write_csv(self.market_rows()))
        train, _ = research.chronological_split(loaded)
        median_points, rate = research.calculate_spread_proxy(train)
        self.assertEqual(median_points, 20.0)
        self.assertGreaterEqual(rate, 0.0)

    def test_backtest_frame_maps_ohlc_and_optional_volume(self):
        loaded = research.load_ohlc(self.write_csv(self.market_rows()))
        frame = research.prepare_backtest_data(loaded)
        self.assertEqual(list(frame.columns), ["Open", "High", "Low", "Close", "Volume"])
        self.assertEqual(len(frame), len(loaded))


if __name__ == "__main__":
    unittest.main()
