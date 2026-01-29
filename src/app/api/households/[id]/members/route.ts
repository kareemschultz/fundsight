import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { householdMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["admin", "contributor", "viewer"]),
});

// PUT - Update a member's role (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify caller is admin
    const callerMembership = await db.query.householdMembers.findFirst({
      where: and(
        eq(householdMembers.householdId, id),
        eq(householdMembers.userId, session.user.id)
      ),
    });

    if (!callerMembership || callerMembership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update member roles" }, { status: 403 });
    }

    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    // Don't let admin demote themselves if they're the only admin
    const targetMember = await db.query.householdMembers.findFirst({
      where: eq(householdMembers.id, result.data.memberId),
    });

    if (!targetMember || targetMember.householdId !== id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await db.update(householdMembers)
      .set({ role: result.data.role })
      .where(eq(householdMembers.id, result.data.memberId));

    return NextResponse.json({ message: "Role updated" });
  } catch (error) {
    console.error("Failed to update member role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

// DELETE - Remove a member or leave household
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      // Leave household
      await db.delete(householdMembers).where(
        and(
          eq(householdMembers.householdId, id),
          eq(householdMembers.userId, session.user.id)
        )
      );
      return NextResponse.json({ message: "Left household" });
    }

    // Remove someone else - admin only
    const callerMembership = await db.query.householdMembers.findFirst({
      where: and(
        eq(householdMembers.householdId, id),
        eq(householdMembers.userId, session.user.id)
      ),
    });

    if (!callerMembership || callerMembership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
    }

    await db.delete(householdMembers).where(eq(householdMembers.id, memberId));

    return NextResponse.json({ message: "Member removed" });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
