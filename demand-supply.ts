export type Zone = {
  type: "DEMAND" | "SUPPLY";
  price: number;
  strength: number;
};

export function detectDemandSupply(prices: number[]): Zone[] {
  if (!prices.length) return [];

  const high = Math.max(...prices);
  const low = Math.min(...prices);

  return [
    {
      type: "SUPPLY",
      price: high,
      strength: 70,
    },
    {
      type: "DEMAND",
      price: low,
      strength: 70,
    },
  ];
}
