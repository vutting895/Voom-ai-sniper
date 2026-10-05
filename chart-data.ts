export type ChartPoint = {
  time: number;
  value: number;
};

export function formatChartData(prices: number[]): ChartPoint[] {
  return prices.map((value, index) => ({
    time: Date.now() + index,
    value,
  }));
}
