export type EnsembleResult = {
  signal: "BUY" | "SELL" | "WAIT";
  confidence: number;
};

export function combineSignals(
  sniperScore: number,
  mlProbability: number,
  drlAction: string
): EnsembleResult {
  let confidence = Math.round((sniperScore + mlProbability) / 2);

  const signal =
    sniperScore >= 70 && mlProbability >= 60 && drlAction === "BUY"
      ? "BUY"
      : "WAIT";

  return {
    signal,
    confidence,
  };
}
