import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { households, householdMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const joinSchema = z.object({
  inviteCode: z.string().min(1).max(20),
});

// POST - Join a household via invite code
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = joinSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }

    // Find household by invite code
    const household = await db.query.households.findFirst({
      where: eq(households.inviteCode, result.data.inviteCode.toUpperCase()),
    });

    if (!household) {
      return NextResponse.json({ error: "Invalid invite code. Please check and try again." }, { status: 404 });
    }

    // Check if already a member
    const existing = await db.query.householdMembers.findFirst({
      where: and(
        eq(householdMembers.householdId, household.id),
        eq(householdMembers.userId, session.user.id)
      ),
    });

    if (existing) {
      return NextResponse.json({ error: "You are already a member of this household" }, { status: 409 });
    }

    // Add as viewer by default
    await db.insert(householdMembers).values({
      householdId: household.id,
      userId: session.user.id,
      role: "viewer",
    });

    return NextResponse.json({ message: "Joined household successfully", household }, { status: 200 });
  } catch (error) {
    console.error("Failed to join household:", error);
    return NextResponse.json({ error: "Failed to join household" }, { status: 500 });
  }
}
