import { NextResponse } from "next/server";
import { getBitkubTicker } from "@/lib/bitkub-provider";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "THB_BTC";

  const ticker = await getBitkubTicker(symbol);

  return NextResponse.json(ticker);
}
