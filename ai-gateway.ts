export type AIAnalysis = {
  signal: string;
  explanation: string;
  confidence: number;
};

export async function analyzeSignal(input: string): Promise<AIAnalysis> {
  return {
    signal: "WAIT",
    explanation: `AI analysis placeholder: ${input}`,
    confidence: 50,
  };
}
