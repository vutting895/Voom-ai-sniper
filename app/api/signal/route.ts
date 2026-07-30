import { NextResponse } from "next/server";
import { calculateSniperScore } from "@/lib/sniper-score";
import { analyzeSignal } from "@/lib/ai-gateway";

export async function POST(request: Request) {
  const body = await request.json();
  const prices = body.prices || [];

  const sniper = calculateSniperScore(prices);
  const ai = await analyzeSignal(JSON.stringify(sniper));

  return NextResponse.json({
    sniper,
    ai,
  });
}
