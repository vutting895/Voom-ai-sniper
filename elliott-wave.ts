export type WaveResult = {
  wave: number;
  trend: "BULLISH" | "BEARISH" | "UNKNOWN";
};

export function detectElliottWave(prices: number[]): WaveResult {
  if (prices.length < 5) {
    return { wave: 0, trend: "UNKNOWN" };
  }

  const start = prices[0];
  const end = prices[prices.length - 1];

  return {
    wave: 1,
    trend: end > start ? "BULLISH" : "BEARISH",
  };
}
