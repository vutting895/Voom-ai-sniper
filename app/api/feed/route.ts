import { NextResponse } from "next/server";
import { getLiveTick } from "@/lib/live-feed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";

  return NextResponse.json(await getLiveTick(symbol));
}
