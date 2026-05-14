import { NextResponse } from "next/server";
import { getReservoirs } from "@/lib/reservoir";

export async function GET() {
  const payload = await getReservoirs();
  return NextResponse.json(payload);
}
