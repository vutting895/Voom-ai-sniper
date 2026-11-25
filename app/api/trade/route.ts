import { NextResponse } from "next/server";

/**
 * Trading execution is intentionally unavailable in the Sniper analysis service.
 * Signals and strategy analysis must never submit broker orders.
 */
export async function POST() {
  return NextResponse.json(
    {
      status: "disabled",
      code: "SNIPER_EXECUTION_DISABLED",
      message: "This service is analysis-only. Broker execution is not available.",
    },
    { status: 410 },
  );
}
