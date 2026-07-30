export type MarketState = {
  price: number;
  rsi: number;
  score: number;
};

export type PPOAction = "HOLD" | "BUY" | "SELL";

export function calculateReward(action: PPOAction, profit: number) {
  if (action === "BUY" && profit > 0) return profit;
  if (action === "SELL" && profit > 0) return profit;
  return -Math.abs(profit);
}
