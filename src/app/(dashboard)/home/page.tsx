import type { Metadata } from "next";
import { db, loans, payments, financialProfiles } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth-cache";
import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your financial portfolio and loan progress.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Fetch user's loans
  const userLoans = await db.query.loans.findMany({
    where: eq(loans.userId, user.id),
    with: {
      lender: true,
    },
    orderBy: (loans, { desc }) => [desc(loans.createdAt)],
  });

  // Fetch recent payments
  const recentPayments = await db.query.payments.findMany({
    where: eq(payments.userId, user.id),
    orderBy: [desc(payments.paymentDate)],
    limit: 5,
    with: {
      loan: {
        with: { lender: true },
      },
    },
  });

  // Fetch financial profile
  const profile = await db.query.financialProfiles.findFirst({
    where: eq(financialProfiles.userId, user.id),
  });

  const hasLoans = userLoans.length > 0;

  // Calculate totals
  const totalOriginal = userLoans.reduce(
    (sum, loan) => sum + parseFloat(loan.originalAmount),
    0
  );
  const totalCurrent = userLoans.reduce(
    (sum, loan) => sum + parseFloat(loan.currentBalance),
    0
  );
  const totalMonthly = userLoans
    .filter((l) => l.isActive)
    .reduce((sum, loan) => sum + parseFloat(loan.monthlyPayment), 0);
  const totalPaid = totalOriginal - totalCurrent;
  const overallProgress =
    totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;
  const activeCount = userLoans.filter((l) => l.isActive).length;

  // Calculate interest saved from extra payments
  const allPayments = await db.query.payments.findMany({
    where: eq(payments.userId, user.id),
  });
  const extraPaymentsTotal = allPayments
    .filter((p) => p.paymentType === "extra")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const avgRate =
    userLoans.length > 0
      ? userLoans.reduce((sum, l) => sum + parseFloat(l.interestRate), 0) /
        userLoans.length
      : 0;
  const estimatedInterestSaved = extraPaymentsTotal * avgRate * 0.5;

  // Payment countdown — find the soonest next payment
  const now = new Date();
  let nextPaymentDays = Infinity;
  let nextPaymentLoan = "";
  userLoans
    .filter((l) => l.isActive)
    .forEach((loan) => {
      const startDate = new Date(loan.startDate);
      const paymentDay = startDate.getDate();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), paymentDay);
      const nextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        paymentDay
      );
      const nextPayment = thisMonth > now ? thisMonth : nextMonth;
      const days = Math.ceil(
        (nextPayment.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days < nextPaymentDays) {
        nextPaymentDays = days;
        nextPaymentLoan = loan.vehicleDescription || "Loan";
      }
    });

  // Gratuity countdown
  let gratuityDays: number | null = null;
  let gratuityAmount = 0;
  if (profile?.nextGratuityDate) {
    const gDate = new Date(profile.nextGratuityDate);
    const diff = Math.ceil(
      (gDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0) {
      gratuityDays = diff;
      gratuityAmount = parseFloat(profile.expectedGratuity || "0");
    }
  }

  // Monthly income for DTI
  const monthlyIncome = profile
    ? parseFloat(profile.monthlyIncome || "0")
    : 0;
  const dti = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;

  // Financial health score (simplified)
  let healthScore = 50;
  if (overallProgress > 0) healthScore += Math.min(overallProgress * 0.3, 30);
  if (allPayments.length > 0) healthScore += 10;
  if (extraPaymentsTotal > 0) healthScore += 10;
  if (dti > 0 && dti < 36) healthScore += 10;
  else if (dti > 50) healthScore -= 10;
  healthScore = Math.min(100, Math.max(0, healthScore));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          {hasLoans
            ? "Here\u2019s an overview of your loan portfolio"
            : "Get started by adding your first loan"}
        </p>
      </div>

      {!hasLoans ? (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <svg
                className="h-12 w-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No loans yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Start tracking your loans from financial institutions including
              GBTI, Republic Bank, and more.
            </p>
            <Link href="/loans/new" className={buttonVariants()}>
              Add Your First Loan
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/loans/new"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              ➕ Add Loan
            </Link>
            <Link
              href="/tracker"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              💳 Record Payment
            </Link>
            <Link
              href="/planning"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              📋 Plan Strategy
            </Link>
            <Link
              href="/scenarios"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              🔄 Compare Scenarios
            </Link>
            <Link
              href="/reports"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              📄 Export Report
            </Link>
          </div>

          {/* Top Row — Progress Ring, Health Gauge, Countdowns */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Progress Ring Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overall Progress</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${overallProgress * 2.64} 264`}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums">
                      {overallProgress.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatCurrency(totalPaid)} paid of{" "}
                  {formatCurrency(totalOriginal)}
                </p>
              </CardContent>
            </Card>

            {/* Financial Health Gauge */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Financial Health</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${healthScore * 2.64} 264`}
                      strokeLinecap="round"
                      className={
                        healthScore >= 70
                          ? "text-green-500"
                          : healthScore >= 40
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums">
                      {healthScore}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      / 100
                    </span>
                  </div>
                </div>
                <p
                  className={`text-xs font-medium mt-2 ${
                    healthScore >= 70
                      ? "text-green-600 dark:text-green-400"
                      : healthScore >= 40
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {healthScore >= 70
                    ? "Excellent"
                    : healthScore >= 40
                      ? "Fair"
                      : "Needs Attention"}
                </p>
              </CardContent>
            </Card>

            {/* Payment Countdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Next Payment</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {nextPaymentDays === Infinity ? (
                    "—"
                  ) : (
                    <>
                      {nextPaymentDays}
                      <span className="text-base font-normal text-muted-foreground ml-1">
                        days
                      </span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nextPaymentDays !== Infinity && (
                  <p className="text-xs text-muted-foreground">
                    {nextPaymentLoan} • {formatCurrency(totalMonthly)} due
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Gratuity Countdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Next Gratuity</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {gratuityDays !== null ? (
                    <>
                      {gratuityDays}
                      <span className="text-base font-normal text-muted-foreground ml-1">
                        days
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gratuityDays !== null ? (
                  <p className="text-xs text-muted-foreground">
                    Expected: {formatCurrency(gratuityAmount)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    <Link
                      href="/settings"
                      className="text-primary hover:underline"
                    >
                      Set gratuity date →
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Borrowed</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatCurrency(totalOriginal)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {activeCount} active loan{activeCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Current Balance</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatCurrency(totalCurrent)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Remaining to pay off
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monthly Obligations</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatCurrency(totalMonthly)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyIncome > 0 && (
                  <p className="text-xs text-muted-foreground">
                    DTI:{" "}
                    <span
                      className={
                        dti > 50
                          ? "text-red-500"
                          : dti > 36
                            ? "text-yellow-500"
                            : "text-green-500"
                      }
                    >
                      {dti.toFixed(1)}%
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Interest Saved</CardDescription>
                <CardTitle className="text-2xl tabular-nums text-green-600 dark:text-green-400">
                  {formatCurrency(estimatedInterestSaved)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  From {formatCurrency(extraPaymentsTotal)} in extra payments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Client-side widgets (Insights + Recent Timeline) */}
          <DashboardWidgets />

          {/* Loans List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Loans</h2>
              <Link
                href="/loans/new"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Add Loan
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {userLoans.map((loan) => {
                const original = parseFloat(loan.originalAmount);
                const current = parseFloat(loan.currentBalance);
                const paid = original - current;
                const progress = (paid / original) * 100;

                return (
                  <Card
                    key={loan.id}
                    className="group hover:border-primary/50 transition-colors"
                  >
                    <Link href={`/loans/${loan.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {loan.vehicleDescription || "Car Loan"}
                            </CardTitle>
                            <CardDescription>
                              {loan.lender?.shortName || "Unknown Lender"}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-muted-foreground tabular-nums">
                              {(parseFloat(loan.interestRate) * 100).toFixed(1)}
                              % APR
                            </span>
                            {!loan.isActive && (
                              <Badge variant="secondary" className="ml-2">
                                Paid Off
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Balance
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatCurrency(current)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Monthly Payment
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatCurrency(
                                parseFloat(loan.monthlyPayment)
                              )}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span className="tabular-nums">
                                {progress.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Payments Timeline */}
          {recentPayments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Payments</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                  </div>
                  <Link
                    href="/tracker"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    View All →
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                            payment.paymentType === "extra"
                              ? "bg-green-100 dark:bg-green-950 text-green-600"
                              : "bg-blue-100 dark:bg-blue-950 text-blue-600"
                          }`}
                        >
                          {payment.paymentType === "extra" ? "⚡" : "💳"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {payment.loan?.vehicleDescription || "Loan"}{" "}
                            <Badge
                              variant="secondary"
                              className="text-[10px] ml-1"
                            >
                              {payment.source}
                            </Badge>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          payment.paymentType === "extra"
                            ? "text-green-600 dark:text-green-400"
                            : ""
                        }`}
                      >
                        {formatCurrency(parseFloat(payment.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
