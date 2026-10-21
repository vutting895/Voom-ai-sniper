import { NextResponse } from "next/server";
import { proxyBridgeRequest } from "@/lib/voom-bridge";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function POST(request: Request) {
  const result = await proxyBridgeRequest(request, "health");
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
