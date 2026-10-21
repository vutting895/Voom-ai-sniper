import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      accepted: false,
      mode: "DISABLED",
      code: "TRADE_EXECUTION_DISABLED",
      message: "No order was sent. Trading through the web API is disabled until authenticated execution and server-side risk checks are implemented.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
