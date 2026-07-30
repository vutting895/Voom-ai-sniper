import { NextResponse } from "next/server";
import { getMarketPrice } from "@/lib/market-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";

  const data = await getMarketPrice(symbol);

  return NextResponse.json(data);
}
