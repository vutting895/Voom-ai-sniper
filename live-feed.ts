export type Tick = {
  symbol: string;
  price: number;
  time: number;
};

export async function getLiveTick(symbol: string): Promise<Tick> {
  return {
    symbol,
    price: 0,
    time: Date.now(),
  };
}
