import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { households, householdMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get household details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify membership
    const membership = await db.query.householdMembers.findFirst({
      where: and(
        eq(householdMembers.householdId, id),
        eq(householdMembers.userId, session.user.id)
      ),
    });

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this household" }, { status: 403 });
    }

    const household = await db.query.households.findFirst({
      where: eq(households.id, id),
      with: {
        members: {
          with: { user: true },
        },
        loans: {
          with: {
            loan: { with: { lender: true, payments: true } },
            sharer: true,
          },
        },
      },
    });

    if (!household) {
      return NextResponse.json({ error: "Household not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...household,
      myRole: membership.role,
      members: household.members.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        user: { id: m.user.id, name: m.user.name, email: m.user.email },
      })),
    });
  } catch (error) {
    console.error("Failed to fetch household:", error);
    return NextResponse.json({ error: "Failed to fetch household" }, { status: 500 });
  }
}

// DELETE - Delete a household (admin only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const membership = await db.query.householdMembers.findFirst({
      where: and(
        eq(householdMembers.householdId, id),
        eq(householdMembers.userId, session.user.id)
      ),
    });

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete households" }, { status: 403 });
    }

    await db.delete(households).where(eq(households.id, id));

    return NextResponse.json({ message: "Household deleted" });
  } catch (error) {
    console.error("Failed to delete household:", error);
    return NextResponse.json({ error: "Failed to delete household" }, { status: 500 });
  }
}
