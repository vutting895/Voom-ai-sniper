export type Position = {
  symbol: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
};

export function calculatePosition(entry: number, riskPercent: number) {
  return {
    entry,
    riskPercent,
    quantity: 0,
  };
}
