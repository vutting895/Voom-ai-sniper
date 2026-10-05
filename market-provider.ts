export type MarketProvider = {
  symbol: string;
  price: number;
  volume?: number;
  timestamp: number;
};

export async function fetchMarketData(symbol: string): Promise<MarketProvider> {
  return {
    symbol,
    price: 0,
    volume: 0,
    timestamp: Date.now(),
  };
}
