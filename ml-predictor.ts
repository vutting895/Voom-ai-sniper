export type Prediction = {
  direction: "UP" | "DOWN" | "SIDEWAY";
  probability: number;
};

export function predictPrice(prices: number[]): Prediction {
  if (prices.length < 2) {
    return {
      direction: "SIDEWAY",
      probability: 50,
    };
  }

  const direction = prices.at(-1)! > prices[0] ? "UP" : "DOWN";

  return {
    direction,
    probability: 55,
  };
}
