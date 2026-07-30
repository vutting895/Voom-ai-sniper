export type OrderSide = "BUY" | "SELL";

export type BitkubOrder = {
  symbol: string;
  side: OrderSide;
  amount: number;
};

export async function createBitkubOrder(order: BitkubOrder) {
  return {
    accepted: false,
    mode: "PAPER_TRADING",
    order,
    message: "Live Bitkub execution requires API key and risk approval",
  };
}
