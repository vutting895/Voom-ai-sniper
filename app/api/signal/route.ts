import { NextResponse } from "next/server";
import { calculateSniperScore } from "@/lib/sniper-score";
import { analyzeSignal } from "@/lib/ai-gateway";
import { saveSignal } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const prices = body.prices || [];
  const symbol = body.symbol || "BTCUSDT";

  const sniper = calculateSniperScore(prices);
  const ai = await analyzeSignal(JSON.stringify(sniper));

  const saved = await saveSignal({
    symbol,
    action: ai.signal,
    score: sniper.score,
    confidence: ai.confidence,
  });

  return NextResponse.json({
    sniper,
    ai,
    saved,
  });
}
