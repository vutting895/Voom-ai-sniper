import { NextResponse } from "next/server";

const disabledResponse = () =>
  NextResponse.json(
    {
      success: false,
      code: "BROKER_AUTH_DISABLED",
      message:
        "Broker connection is disabled until authenticated per-user identity and encrypted secret storage are implemented. No credentials were stored.",
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      accounts: {},
      code: "BROKER_AUTH_DISABLED",
      message: "Broker connection is not configured.",
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function POST() {
  return disabledResponse();
}

export async function PATCH() {
  return disabledResponse();
}
