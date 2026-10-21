import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      accepted: false,
      mode: "DISABLED",
      code: "TRADE_EXECUTION_DISABLED",
      message:
        "Trade execution is disabled. No order was sent. An authenticated broker session and server-side risk checks are required before execution can be enabled.",
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
