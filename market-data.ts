export type MarketCandle = {
  symbol: string;
  price: number;
  timestamp: number;
};

export async function getMarketPrice(symbol: string): Promise<MarketCandle> {
  return {
    symbol,
    price: 0,
    timestamp: Date.now(),
  };
}
