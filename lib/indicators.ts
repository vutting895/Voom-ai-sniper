export function calculateRSI(prices: number[]): number {
  if (prices.length < 2) return 50;

  const gains = prices.slice(1).filter((v, i) => v > prices[i]);
  const losses = prices.slice(1).filter((v, i) => v < prices[i]);

  if (!losses.length) return 100;

  return Math.round((gains.length / prices.length) * 100);
}

export function detectTrend(prices: number[]) {
  if (prices.length < 2) return "NEUTRAL";
  return prices.at(-1)! > prices[0] ? "UP" : "DOWN";
}
