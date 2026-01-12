import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, loans } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createLoanSchema = z.object({
  lenderId: z.string().uuid().nullable().optional(),
  vehicleDescription: z.string().optional(),
  originalAmount: z.number().positive("Original amount must be positive"),
  currentBalance: z.number().positive("Current balance must be positive"),
  interestRate: z.number().min(0).max(1), // Decimal rate (0.12 = 12%)
  monthlyPayment: z.number().positive("Monthly payment must be positive"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date",
  }),
  termMonths: z.number().int().positive().nullable().optional(),
  notes: z.string().optional(),
});

// GET - List all loans for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userLoans = await db.query.loans.findMany({
      where: eq(loans.userId, session.user.id),
      with: {
        lender: true,
      },
      orderBy: (loans, { desc }) => [desc(loans.createdAt)],
    });

    return NextResponse.json(userLoans);
  } catch (error) {
    console.error("Failed to fetch loans:", error);
    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 }
    );
  }
}

// POST - Create a new loan
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = createLoanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Create the loan
    const [newLoan] = await db
      .insert(loans)
      .values({
        userId: session.user.id,
        lenderId: data.lenderId || null,
        vehicleDescription: data.vehicleDescription || null,
        originalAmount: data.originalAmount.toString(),
        currentBalance: data.currentBalance.toString(),
        interestRate: data.interestRate.toString(),
        monthlyPayment: data.monthlyPayment.toString(),
        startDate: data.startDate,
        termMonths: data.termMonths || null,
        notes: data.notes || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newLoan, { status: 201 });
  } catch (error) {
    console.error("Failed to create loan:", error);
    return NextResponse.json(
      { error: "Failed to create loan" },
      { status: 500 }
    );
  }
}
