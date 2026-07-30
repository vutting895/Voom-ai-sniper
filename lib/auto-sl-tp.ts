export type TradeLevels = {
  stopLoss: number;
  takeProfit: number;
};

export function calculateSLTP(entry: number, riskPercent: number): TradeLevels {
  const risk = entry * (riskPercent / 100);

  return {
    stopLoss: entry - risk,
    takeProfit: entry + risk * 2,
  };
}
