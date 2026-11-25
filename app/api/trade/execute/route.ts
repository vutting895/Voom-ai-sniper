import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      accepted: false,
      mode: "DISABLED",
      code: "MT5_EXECUTION_DISABLED",
      message: "No order was sent. Web-based MT5 execution remains disabled until authenticated execution and server-side risk checks are implemented.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
