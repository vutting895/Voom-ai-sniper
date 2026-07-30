export type BitkubTicker = {
  symbol: string;
  last: number;
  volume: number;
  timestamp: number;
};

export async function getBitkubTicker(symbol: string = "THB_BTC"): Promise<BitkubTicker> {
  return {
    symbol,
    last: 0,
    volume: 0,
    timestamp: Date.now(),
  };
}
