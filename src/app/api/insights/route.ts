import { auth } from "@/lib/auth";
import { db, loans, financialProfiles, payments } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface Insight {
  id: string;
  category: "strategy" | "warning" | "milestone" | "tip" | "optimization";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const [userLoans, userProfile, userPayments] = await Promise.all([
      db.query.loans.findMany({
        where: eq(loans.userId, userId),
        with: { lender: true },
      }),
      db.query.financialProfiles.findFirst({
        where: eq(financialProfiles.userId, userId),
      }),
      db.query.payments.findMany({
        where: eq(payments.userId, userId),
        orderBy: (p, { desc }) => [desc(p.paymentDate)],
      }),
    ]);

    const insights: Insight[] = [];

    if (userLoans.length === 0) {
      return NextResponse.json({ insights: [] });
    }

    const activeLoans = userLoans.filter((l) => l.isActive);
    const totalBalance = activeLoans.reduce(
      (sum, l) => sum + parseFloat(l.currentBalance),
      0
    );
    const totalOriginal = activeLoans.reduce(
      (sum, l) => sum + parseFloat(l.originalAmount),
      0
    );
    const totalMonthly = activeLoans.reduce(
      (sum, l) => sum + parseFloat(l.monthlyPayment),
      0
    );
    const monthlyIncome = userProfile
      ? parseFloat(userProfile.monthlyIncome || "0")
      : 0;

    // 1. Debt-to-Income Monitoring
    if (monthlyIncome > 0) {
      const dti = (totalMonthly / monthlyIncome) * 100;

      if (dti > 50) {
        insights.push({
          id: "dti-critical",
          category: "warning",
          title: "High Debt-to-Income Ratio",
          message: `Your DTI is ${dti.toFixed(1)}% — well above the recommended 36%. Consider increasing income or accelerating payoff on your highest-rate loan.`,
          priority: "high",
          icon: "⚠️",
        });
      } else if (dti > 36) {
        insights.push({
          id: "dti-elevated",
          category: "warning",
          title: "Elevated Debt-to-Income",
          message: `Your DTI is ${dti.toFixed(1)}%. Aim to bring this below 36% for better financial health. Extra payments on high-interest loans help most.`,
          priority: "medium",
          icon: "📊",
        });
      } else {
        insights.push({
          id: "dti-healthy",
          category: "milestone",
          title: "Healthy Debt-to-Income Ratio",
          message: `Your DTI is ${dti.toFixed(1)}% — within the healthy range. Keep it up!`,
          priority: "low",
          icon: "✅",
        });
      }

      // Savings Rate Analysis
      const savingsRate =
        ((monthlyIncome - totalMonthly) / monthlyIncome) * 100;
      if (savingsRate < 20) {
        insights.push({
          id: "savings-low",
          category: "tip",
          title: "Boost Your Savings Rate",
          message: `After loan payments, you're saving ~${savingsRate.toFixed(0)}% of income. Financial experts recommend saving at least 20%. Even small additional savings compound over time.`,
          priority: "medium",
          icon: "💰",
        });
      }
    }

    // 2. Payment Strategy Suggestions
    if (activeLoans.length > 1) {
      // Find the highest interest rate loan
      const highestRate = activeLoans.reduce((max, l) =>
        parseFloat(l.interestRate) > parseFloat(max.interestRate) ? l : max
      );
      const lowestBalance = activeLoans.reduce((min, l) =>
        parseFloat(l.currentBalance) < parseFloat(min.currentBalance) ? l : min
      );

      if (highestRate.id !== lowestBalance.id) {
        insights.push({
          id: "avalanche-strategy",
          category: "strategy",
          title: "Avalanche Strategy Opportunity",
          message: `Your ${highestRate.vehicleDescription || "loan"} has the highest rate (${(parseFloat(highestRate.interestRate) * 100).toFixed(1)}%). Directing extra payments here saves the most in interest over time.`,
          priority: "high",
          icon: "🎯",
        });

        insights.push({
          id: "snowball-strategy",
          category: "strategy",
          title: "Quick Win Available",
          message: `Your ${lowestBalance.vehicleDescription || "loan"} has the lowest balance ($${parseFloat(lowestBalance.currentBalance).toLocaleString()}). Paying it off first gives you momentum and frees up $${parseFloat(lowestBalance.monthlyPayment).toLocaleString()}/mo.`,
          priority: "medium",
          icon: "⚡",
        });
      }
    }

    // 3. Gratuity Allocation Optimizer
    if (userProfile) {
      const expectedGratuity = parseFloat(
        userProfile.expectedGratuity || "0"
      );
      const nextGratuityDate = userProfile.nextGratuityDate;

      if (expectedGratuity > 0 && nextGratuityDate) {
        const daysUntil = Math.ceil(
          (new Date(nextGratuityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil > 0 && daysUntil <= 90) {
          // Find best loan to apply gratuity to
          const bestTarget = activeLoans.reduce((best, l) =>
            parseFloat(l.interestRate) > parseFloat(best.interestRate) ? l : best
          );

          const monthlyRate = parseFloat(bestTarget.interestRate) / 12;
          const interestSaved = expectedGratuity * monthlyRate * 12; // approximate 1 year savings

          insights.push({
            id: "gratuity-optimizer",
            category: "optimization",
            title: "Gratuity Coming Soon",
            message: `Your gratuity of $${expectedGratuity.toLocaleString()} arrives in ~${daysUntil} days. Applying it to your ${bestTarget.vehicleDescription || "highest-rate loan"} could save ~$${Math.round(interestSaved).toLocaleString()} in interest over the next year.`,
            priority: "high",
            icon: "🎁",
          });
        }
      }
    }

    // 4. Payment Consistency Analysis
    if (userPayments.length > 0) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentPayments = userPayments.filter(
        (p) => new Date(p.paymentDate) >= thirtyDaysAgo
      );

      if (recentPayments.length === 0 && activeLoans.length > 0) {
        insights.push({
          id: "payment-gap",
          category: "warning",
          title: "No Recent Payments",
          message: `No payments recorded in the last 30 days. Staying on schedule prevents interest accumulation and keeps your financial health score high.`,
          priority: "high",
          icon: "🔔",
        });
      }

      // Check for extra payments trend
      const extraPayments = userPayments.filter(
        (p) => p.paymentType === "extra"
      );
      if (extraPayments.length > 0) {
        const totalExtra = extraPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount),
          0
        );
        // Estimate interest saved from extra payments
        const avgRate =
          activeLoans.reduce((sum, l) => sum + parseFloat(l.interestRate), 0) /
          Math.max(activeLoans.length, 1);
        const estimatedSaved = totalExtra * avgRate * 0.5; // rough estimate

        insights.push({
          id: "extra-payment-impact",
          category: "milestone",
          title: "Extra Payments Making Impact",
          message: `You've made $${totalExtra.toLocaleString()} in extra payments across ${extraPayments.length} transactions. This has saved you an estimated $${Math.round(estimatedSaved).toLocaleString()} in interest!`,
          priority: "low",
          icon: "🏆",
        });
      }
    }

    // 5. Progress Milestones
    const overallProgress =
      totalOriginal > 0
        ? ((totalOriginal - totalBalance) / totalOriginal) * 100
        : 0;

    const milestones = [25, 50, 75, 90];
    for (const m of milestones) {
      if (overallProgress >= m && overallProgress < m + 5) {
        insights.push({
          id: `milestone-${m}`,
          category: "milestone",
          title: `${m}% Milestone Reached!`,
          message: `You've paid off ${overallProgress.toFixed(1)}% of your total loan balance. ${m === 50 ? "You're halfway there! 🎉" : m === 75 ? "The finish line is in sight!" : m === 90 ? "Almost debt-free! Final push!" : "Great progress — keep going!"}`,
          priority: "medium",
          icon: m >= 75 ? "🎉" : "📈",
        });
        break;
      }
    }

    // 6. Emergency Fund Check
    if (userProfile) {
      const emergencyFund = parseFloat(userProfile.emergencyFund || "0");
      const monthsOfExpenses =
        totalMonthly > 0 ? emergencyFund / totalMonthly : 0;

      if (monthsOfExpenses < 3 && monthlyIncome > 0) {
        insights.push({
          id: "emergency-fund",
          category: "tip",
          title: "Build Emergency Fund",
          message: `Your emergency fund covers ~${monthsOfExpenses.toFixed(1)} months of loan payments. Aim for 3-6 months to protect against unexpected disruptions.`,
          priority: "medium",
          icon: "🛡️",
        });
      }
    }

    // 7. Budget Recommendations
    if (monthlyIncome > 0) {
      const available = monthlyIncome - totalMonthly;

      if (available > 0) {
        const optimalExtra = Math.min(available * 0.3, totalBalance * 0.05);
        if (optimalExtra > 10000) {
          insights.push({
            id: "budget-extra",
            category: "optimization",
            title: "Optimal Extra Payment",
            message: `Based on your income and expenses, you could comfortably allocate ~$${Math.round(optimalExtra).toLocaleString()}/month as extra payments. This balances debt payoff with maintaining quality of life.`,
            priority: "medium",
            icon: "📋",
          });
        }
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    insights.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("[INSIGHTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
