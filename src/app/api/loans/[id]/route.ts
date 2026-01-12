import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, loans } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateLoanSchema = z.object({
  vehicleDescription: z.string().optional(),
  currentBalance: z.number().positive().optional(),
  monthlyPayment: z.number().positive().optional(),
  interestRate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

// GET - Get a single loan
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const loan = await db.query.loans.findFirst({
      where: and(eq(loans.id, id), eq(loans.userId, session.user.id)),
      with: {
        lender: true,
        payments: {
          orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
          limit: 10,
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error("Failed to fetch loan:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan" },
      { status: 500 }
    );
  }
}

// PUT - Update a loan
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
    const body = await request.json();

    // Validate input
    const result = updateLoanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check ownership
    const existingLoan = await db.query.loans.findFirst({
      where: and(eq(loans.id, id), eq(loans.userId, session.user.id)),
    });

    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const data = result.data;

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.vehicleDescription !== undefined) {
      updateData.vehicleDescription = data.vehicleDescription;
    }
    if (data.currentBalance !== undefined) {
      updateData.currentBalance = data.currentBalance.toString();
    }
    if (data.monthlyPayment !== undefined) {
      updateData.monthlyPayment = data.monthlyPayment.toString();
    }
    if (data.interestRate !== undefined) {
      updateData.interestRate = data.interestRate.toString();
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const [updatedLoan] = await db
      .update(loans)
      .set(updateData)
      .where(and(eq(loans.id, id), eq(loans.userId, session.user.id)))
      .returning();

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Failed to update loan:", error);
    return NextResponse.json(
      { error: "Failed to update loan" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a loan
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

    // Check ownership
    const existingLoan = await db.query.loans.findFirst({
      where: and(eq(loans.id, id), eq(loans.userId, session.user.id)),
    });

    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    await db
      .delete(loans)
      .where(and(eq(loans.id, id), eq(loans.userId, session.user.id)));

    return NextResponse.json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Failed to delete loan:", error);
    return NextResponse.json(
      { error: "Failed to delete loan" },
      { status: 500 }
    );
  }
}
