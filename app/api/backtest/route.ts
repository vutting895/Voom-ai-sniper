import { NextResponse } from "next/server";
import { runBacktest } from "@/lib/backtest-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const result = runBacktest(body.prices || []);

  return NextResponse.json(result);
}
