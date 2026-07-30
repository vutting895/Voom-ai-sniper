import { aiConfig } from "./ai-config";

export type SignalAnalysis = {
  decision: "BUY" | "SELL" | "WAIT";
  reason: string;
  confidence: number;
};

export async function analyzeMarket(signal: unknown): Promise<SignalAnalysis> {
  return {
    decision: "WAIT",
    reason: `${aiConfig.model} analysis placeholder: ${JSON.stringify(signal)}`,
    confidence: 50,
  };
}
