/**
 * Legacy broker-credential handler intentionally disabled.
 * This file is not a supported Next.js route and must not be mounted.
 * Broker credentials and account management belong outside the Sniper analysis service.
 */
export const runtime = "nodejs";

export async function GET() {
  return new Response(JSON.stringify({ status: "disabled", code: "BROKER_CREDENTIALS_DISABLED" }), {
    status: 410,
    headers: { "content-type": "application/json" },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ status: "disabled", code: "BROKER_CREDENTIALS_DISABLED" }), {
    status: 410,
    headers: { "content-type": "application/json" },
  });
}

export async function PATCH() {
  return new Response(JSON.stringify({ status: "disabled", code: "BROKER_CREDENTIALS_DISABLED" }), {
    status: 410,
    headers: { "content-type": "application/json" },
  });
}
