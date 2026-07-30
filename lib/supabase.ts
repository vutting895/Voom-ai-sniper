export type SignalRecord = {
  symbol: string;
  action: string;
  score: number;
  confidence: number;
};

export async function saveSignal(record: SignalRecord) {
  // Connect Supabase SDK here after environment setup
  return {
    saved: true,
    record,
  };
}
