import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { householdLoans, householdMembers, loans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const shareLoanSchema = z.object({
  loanId: z.string().uuid(),
});

// POST - Share a loan with household
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify membership with contributor+ role
    const membership = await db.query.householdMembers.findFirst({
      where: and(
        eq(householdMembers.householdId, id),
        eq(householdMembers.userId, session.user.id)
      ),
    });

    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ error: "Contributors and admins can share loans" }, { status: 403 });
    }

    const body = await request.json();
    const result = shareLoanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    // Verify the loan belongs to the user
    const loan = await db.query.loans.findFirst({
      where: and(
        eq(loans.id, result.data.loanId),
        eq(loans.userId, session.user.id)
      ),
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found or does not belong to you" }, { status: 404 });
    }

    // Check if already shared
    const existing = await db.query.householdLoans.findFirst({
      where: and(
        eq(householdLoans.householdId, id),
        eq(householdLoans.loanId, result.data.loanId)
      ),
    });

    if (existing) {
      return NextResponse.json({ error: "This loan is already shared with this household" }, { status: 409 });
    }

    const [shared] = await db.insert(householdLoans).values({
      householdId: id,
      loanId: result.data.loanId,
      sharedBy: session.user.id,
    }).returning();

    return NextResponse.json(shared, { status: 201 });
  } catch (error) {
    console.error("Failed to share loan:", error);
    return NextResponse.json({ error: "Failed to share loan" }, { status: 500 });
  }
}

// DELETE - Unshare a loan from household
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
    const loanId = searchParams.get("loanId");

    if (!loanId) {
      return NextResponse.json({ error: "loanId query parameter required" }, { status: 400 });
    }

    const membership = await db.query.householdMembers.findFirst({
      where: and(
        eq(householdMembers.householdId, id),
        eq(householdMembers.userId, session.user.id)
      ),
    });

    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    await db.delete(householdLoans).where(
      and(
        eq(householdLoans.householdId, id),
        eq(householdLoans.loanId, loanId)
      )
    );

    return NextResponse.json({ message: "Loan unshared" });
  } catch (error) {
    console.error("Failed to unshare loan:", error);
    return NextResponse.json({ error: "Failed to unshare loan" }, { status: 500 });
  }
}
