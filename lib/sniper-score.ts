import { detectElliottWave } from "./elliott-wave";
import { detectDemandSupply } from "./demand-supply";

export function calculateSniperScore(prices: number[]) {
  const wave = detectElliottWave(prices);
  const zones = detectDemandSupply(prices);

  let score = 50;

  if (wave.trend === "BULLISH") score += 20;
  if (wave.trend === "BEARISH") score -= 20;
  if (zones.length > 0) score += 10;

  return {
    score,
    wave,
    zones,
    rating: score >= 70 ? "SNIPER" : "WAIT",
  };
}
