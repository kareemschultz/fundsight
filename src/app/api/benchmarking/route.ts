import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { benchmarkingOptIn, loans, payments, lenders } from "@/lib/db/schema";
import { eq, avg, count, sql, and, inArray } from "drizzle-orm";

// GET - Get anonymized benchmarking data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has opted in
    const optIn = await db.query.benchmarkingOptIn.findFirst({
      where: eq(benchmarkingOptIn.userId, session.user.id),
    });

    if (!optIn?.optedIn) {
      return NextResponse.json({
        optedIn: false,
        message: "Opt in to see anonymized benchmarking data",
      });
    }

    // Get all opted-in user IDs
    const optedInUsers = await db
      .select({ userId: benchmarkingOptIn.userId })
      .from(benchmarkingOptIn)
      .where(eq(benchmarkingOptIn.optedIn, true));

    const optedInUserIds = optedInUsers.map((u) => u.userId);

    if (optedInUserIds.length < 2) {
      return NextResponse.json({
        optedIn: true,
        insufficient: true,
        message: "Not enough participants yet for meaningful benchmarks",
        participantCount: optedInUserIds.length,
      });
    }

    // 1. Average payoff time by lender (in months, from loan term)
    const avgPayoffByLender = await db
      .select({
        lenderName: lenders.shortName,
        avgTermMonths: avg(loans.termMonths),
        avgRate: avg(loans.interestRate),
        loanCount: count(loans.id),
      })
      .from(loans)
      .leftJoin(lenders, eq(loans.lenderId, lenders.id))
      .where(and(
        inArray(loans.userId, optedInUserIds),
        sql`${loans.termMonths} IS NOT NULL`
      ))
      .groupBy(lenders.shortName);

    // 2. Extra payment statistics
    const extraPaymentStats = await db
      .select({
        avgAmount: avg(payments.amount),
        totalExtra: count(payments.id),
      })
      .from(payments)
      .where(and(
        inArray(payments.userId, optedInUserIds),
        eq(payments.paymentType, "extra")
      ));

    // 3. Payment frequency distribution (by source)
    const paymentBySource = await db
      .select({
        source: payments.source,
        count: count(payments.id),
        avgAmount: avg(payments.amount),
      })
      .from(payments)
      .where(inArray(payments.userId, optedInUserIds))
      .groupBy(payments.source);

    // 4. Calculate health score percentiles
    // Get all user loan data to compute scores
    const allUserLoans = await db
      .select({
        userId: loans.userId,
        originalAmount: loans.originalAmount,
        currentBalance: loans.currentBalance,
      })
      .from(loans)
      .where(and(
        inArray(loans.userId, optedInUserIds),
        eq(loans.isActive, true)
      ));

    // Calculate simple progress scores per user
    const userScores: Record<string, number[]> = {};
    allUserLoans.forEach((loan) => {
      const orig = parseFloat(loan.originalAmount);
      const curr = parseFloat(loan.currentBalance);
      const progress = orig > 0 ? ((orig - curr) / orig) * 100 : 0;
      if (!userScores[loan.userId]) userScores[loan.userId] = [];
      userScores[loan.userId].push(progress);
    });

    const scores = Object.values(userScores).map(
      (progressArr) => progressArr.reduce((a, b) => a + b, 0) / progressArr.length
    );
    scores.sort((a, b) => a - b);

    const getPercentile = (arr: number[], p: number) => {
      if (arr.length === 0) return 0;
      const idx = Math.ceil((p / 100) * arr.length) - 1;
      return Math.round(arr[Math.max(0, idx)]);
    };

    // Calculate where the current user falls
    const currentUserLoans = allUserLoans.filter((l) => l.userId === session.user.id);
    let userPercentile = 50;
    if (currentUserLoans.length > 0) {
      const userAvgProgress = currentUserLoans.reduce((acc, l) => {
        const orig = parseFloat(l.originalAmount);
        const curr = parseFloat(l.currentBalance);
        return acc + (orig > 0 ? ((orig - curr) / orig) * 100 : 0);
      }, 0) / currentUserLoans.length;

      const belowCount = scores.filter((s) => s < userAvgProgress).length;
      userPercentile = Math.round((belowCount / scores.length) * 100);
    }

    return NextResponse.json({
      optedIn: true,
      participantCount: optedInUserIds.length,
      avgPayoffByLender: avgPayoffByLender.map((l) => ({
        lender: l.lenderName || "Other",
        avgMonths: l.avgTermMonths ? Math.round(parseFloat(String(l.avgTermMonths))) : null,
        avgRate: l.avgRate ? parseFloat(parseFloat(String(l.avgRate)).toFixed(4)) : null,
        loanCount: l.loanCount,
      })),
      extraPayments: {
        avgAmount: extraPaymentStats[0]?.avgAmount
          ? Math.round(parseFloat(String(extraPaymentStats[0].avgAmount)))
          : 0,
        totalCount: extraPaymentStats[0]?.totalExtra || 0,
      },
      paymentSources: paymentBySource.map((p) => ({
        source: p.source,
        count: p.count,
        avgAmount: p.avgAmount ? Math.round(parseFloat(String(p.avgAmount))) : 0,
      })),
      healthScorePercentiles: {
        p25: getPercentile(scores, 25),
        p50: getPercentile(scores, 50),
        p75: getPercentile(scores, 75),
        p90: getPercentile(scores, 90),
        yourPercentile: userPercentile,
      },
    });
  } catch (error) {
    console.error("Failed to fetch benchmarking data:", error);
    return NextResponse.json({ error: "Failed to fetch benchmarking data" }, { status: 500 });
  }
}

// POST - Opt in/out of benchmarking
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const optIn = Boolean(body.optIn);

    const existing = await db.query.benchmarkingOptIn.findFirst({
      where: eq(benchmarkingOptIn.userId, session.user.id),
    });

    if (existing) {
      await db.update(benchmarkingOptIn)
        .set({
          optedIn: optIn,
          optedInAt: optIn ? new Date() : null,
        })
        .where(eq(benchmarkingOptIn.userId, session.user.id));
    } else {
      await db.insert(benchmarkingOptIn).values({
        userId: session.user.id,
        optedIn: optIn,
        optedInAt: optIn ? new Date() : null,
      });
    }

    return NextResponse.json({ optedIn: optIn });
  } catch (error) {
    console.error("Failed to update opt-in:", error);
    return NextResponse.json({ error: "Failed to update opt-in" }, { status: 500 });
  }
}
