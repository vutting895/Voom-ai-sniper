import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    status: "ok",
    module: "Voom AI Sniper",
    input: body,
    message: "AI Gateway module ready for connection",
  });
}
