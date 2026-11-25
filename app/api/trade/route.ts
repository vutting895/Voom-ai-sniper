import { NextResponse } from "next/server";

/**
 * Trading execution is permanently outside the Sniper analysis service.
 * Signals and strategy analysis must never submit broker orders.
 */
export async function POST() {
  return NextResponse.json(
    {
      accepted: false,
      status: "disabled",
      code: "SNIPER_EXECUTION_DISABLED",
      message: "This service is analysis-only. No broker order was sent.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
