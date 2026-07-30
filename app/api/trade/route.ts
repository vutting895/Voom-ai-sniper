import { NextResponse } from "next/server";
import { createBitkubOrder } from "@/lib/bitkub-order";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await createBitkubOrder(body);

  return NextResponse.json(result);
}
