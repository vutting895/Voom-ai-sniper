export type RiskConfig = {
  maxLossPercent: number;
  riskReward: number;
};

export function calculateRisk(entry: number, stopLoss: number, target: number) {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target - entry);

  return {
    risk,
    reward,
    ratio: risk === 0 ? 0 : reward / risk,
    safe: reward / (risk || 1) >= 2,
  };
}
