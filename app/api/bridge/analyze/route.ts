import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function disabled() {
  return NextResponse.json(
    {
      ok: false,
      code: "BRIDGE_ACCESS_DISABLED",
      message: "Bridge access remains disabled until authenticated user authorization, tenant isolation, and a non-production test boundary are verified.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return disabled();
}

export async function POST() {
  return disabled();
}
