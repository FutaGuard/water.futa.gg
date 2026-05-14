import { NextResponse } from "next/server";
import { getReservoirs } from "@/lib/reservoir";

export const revalidate = 60;

export async function GET() {
  const payload = await getReservoirs();
  return NextResponse.json(payload);
}
