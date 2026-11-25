import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function disabled() {
  return NextResponse.json(
    {
      success: false,
      code: "BROKER_AUTH_DISABLED",
      message: "Broker auth is disabled until per-user authentication and encrypted secret storage are implemented.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return NextResponse.json(
    { success: false, accounts: {}, code: "BROKER_AUTH_DISABLED", message: "Broker connection is not configured." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST() {
  return disabled();
}

export async function PATCH() {
  return disabled();
}
