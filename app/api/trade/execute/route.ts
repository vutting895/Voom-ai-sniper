import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      accepted: false,
      mode: "DISABLED",
      code: "MT5_EXECUTION_DISABLED",
      message:
        "MT5 execution is not connected to this web app. No order was sent. Use the trusted local Bridge only after its risk checks are verified.",
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
