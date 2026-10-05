export type TradingSignal = {
  symbol: string;
  action: "BUY" | "SELL" | "WAIT";
  confidence: number;
};

export function generateSniperSignal(symbol: string): TradingSignal {
  return {
    symbol,
    action: "WAIT",
    confidence: 50,
  };
}
