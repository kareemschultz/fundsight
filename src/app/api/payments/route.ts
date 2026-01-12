import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, payments, loans } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createPaymentSchema = z.object({
  loanId: z.string().uuid(),
  paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date",
  }),
  amount: z.number().positive("Amount must be positive"),
  paymentType: z.enum(["regular", "extra"]),
  source: z.enum(["salary", "gratuity", "bonus", "investment", "savings", "other"]),
  notes: z.string().optional(),
});

// GET - List payments for a user (optionally filtered by loan)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get("loanId");

    let whereClause = eq(payments.userId, session.user.id);
    if (loanId) {
      whereClause = and(whereClause, eq(payments.loanId, loanId))!;
    }

    const userPayments = await db.query.payments.findMany({
      where: whereClause,
      with: {
        loan: {
          columns: {
            vehicleDescription: true,
          },
          with: {
            lender: {
              columns: {
                shortName: true,
              },
            },
          },
        },
      },
      orderBy: [desc(payments.paymentDate)],
    });

    return NextResponse.json(userPayments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST - Record a new payment
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = createPaymentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify loan ownership
    const loan = await db.query.loans.findFirst({
      where: and(eq(loans.id, data.loanId), eq(loans.userId, session.user.id)),
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Calculate interest and principal portions
    const currentBalance = parseFloat(loan.currentBalance);
    const monthlyRate = parseFloat(loan.interestRate) / 12;
    const interestPortion = currentBalance * monthlyRate;
    const principalPortion = Math.max(0, data.amount - interestPortion);

    // Create the payment
    const [newPayment] = await db
      .insert(payments)
      .values({
        loanId: data.loanId,
        userId: session.user.id,
        paymentDate: data.paymentDate,
        amount: data.amount.toString(),
        principalPortion: principalPortion.toString(),
        interestPortion: interestPortion.toString(),
        paymentType: data.paymentType,
        source: data.source,
        notes: data.notes || null,
      })
      .returning();

    // Update loan balance
    const newBalance = Math.max(0, currentBalance - principalPortion);
    await db
      .update(loans)
      .set({
        currentBalance: newBalance.toString(),
        updatedAt: new Date(),
        isActive: newBalance > 0,
        paidOffDate: newBalance <= 0 ? new Date().toISOString().split("T")[0] : null,
      })
      .where(eq(loans.id, data.loanId));

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
