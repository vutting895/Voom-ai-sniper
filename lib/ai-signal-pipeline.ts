import { predictPrice } from "./ml-predictor";
import { calculateSniperScore } from "./sniper-score";

export function generateAISignal(prices: number[]) {
  const sniper = calculateSniperScore(prices);
  const prediction = predictPrice(prices);

  return {
    sniper,
    prediction,
    finalSignal:
      sniper.score >= 70 && prediction.direction === "UP"
        ? "BUY"
        : "WAIT",
  };
}
