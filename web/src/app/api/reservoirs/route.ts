import { NextResponse } from "next/server";
import { getReservoirs } from "@/lib/reservoir";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getReservoirs();
  return NextResponse.json(payload);
}
