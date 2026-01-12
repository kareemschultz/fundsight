import { NextResponse } from "next/server";
import { db, lenders } from "@/lib/db";

export async function GET() {
  try {
    const allLenders = await db.query.lenders.findMany({
      orderBy: (lenders, { asc }) => [asc(lenders.name)],
    });

    return NextResponse.json(allLenders);
  } catch (error) {
    console.error("Failed to fetch lenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch lenders" },
      { status: 500 }
    );
  }
}
