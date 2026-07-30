export type TradeRiskResult = {
  approved: boolean;
  reason: string;
};

export function validateTrade(score: number, confidence: number): TradeRiskResult {
  const approved = score >= 70 && confidence >= 70;

  return {
    approved,
    reason: approved
      ? "Risk criteria passed"
      : "Signal confidence too low",
  };
}
