import { auth } from "@/lib/auth";
import { db, loans } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const metadata = {
  title: "Dashboard | Guyana Loan Tracker",
  description: "Overview of your car loans",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Fetch user's loans
  const userLoans = await db.query.loans.findMany({
    where: eq(loans.userId, session.user.id),
    with: {
      lender: true,
    },
    orderBy: (loans, { desc }) => [desc(loans.createdAt)],
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
  const totalPaid = totalOriginal - totalCurrent;
  const overallProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

  // Format currency in GYD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GY", {
      style: "currency",
      currency: "GYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          {hasLoans
            ? "Here's an overview of your loan portfolio"
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
              Start tracking your car loans from GPSCCU, GBTI, Republic Bank,
              and other Guyanese financial institutions.
            </p>
            <Link href="/loans/new" className={buttonVariants()}>
              Add Your First Loan
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Borrowed</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(totalOriginal)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {userLoans.length} active loan{userLoans.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Current Balance</CardDescription>
                <CardTitle className="text-2xl">
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
                <CardDescription>Total Paid</CardDescription>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  {formatCurrency(totalPaid)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Principal reduced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overall Progress</CardDescription>
                <CardTitle className="text-2xl">
                  {overallProgress.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={overallProgress} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Loans List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Loans</h2>
              <Link href="/loans/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Add Loan
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {userLoans.map((loan) => {
                const original = parseFloat(loan.originalAmount);
                const current = parseFloat(loan.currentBalance);
                const paid = original - current;
                const progress = (paid / original) * 100;

                return (
                  <Card key={loan.id} className="hover:border-primary/50 transition-colors">
                    <Link href={`/loans/${loan.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {loan.vehicleDescription || "Car Loan"}
                            </CardTitle>
                            <CardDescription>
                              {loan.lender?.shortName || "Unknown Lender"}
                            </CardDescription>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {(parseFloat(loan.interestRate) * 100).toFixed(1)}% APR
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Balance</span>
                            <span className="font-medium">
                              {formatCurrency(current)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Payment</span>
                            <span className="font-medium">
                              {formatCurrency(parseFloat(loan.monthlyPayment))}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{progress.toFixed(1)}%</span>
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
        </>
      )}
    </div>
  );
}
