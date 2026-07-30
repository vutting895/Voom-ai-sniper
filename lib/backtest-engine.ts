export type BacktestResult = {
  trades: number;
  winRate: number;
  profit: number;
};

export function runBacktest(prices: number[]): BacktestResult {
  return {
    trades: Math.max(0, prices.length - 1),
    winRate: 50,
    profit: 0,
  };
}
