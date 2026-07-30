import { NextResponse } from "next/server";
import { calculatePosition } from "@/lib/position-manager";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json(
    calculatePosition(
      body.entry || 0,
      body.riskPercent || 1
    )
  );
}
