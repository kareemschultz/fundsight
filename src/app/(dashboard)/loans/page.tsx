import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db, loans } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/constants";

export const metadata: Metadata = {
  title: "My Loans",
  description: "Manage and track all your active and paid-off loans.",
};

export default async function LoansPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userLoans = await db.query.loans.findMany({
    where: eq(loans.userId, session.user.id),
    with: {
      lender: true,
    },
    orderBy: (loans, { desc }) => [desc(loans.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Loans</h1>
          <p className="text-muted-foreground">
            Manage and track all your active loans
          </p>
        </div>
        <Link href="/loans/new" className={buttonVariants()}>
          Add New Loan
        </Link>
      </div>

      {userLoans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <svg
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7h-6.5l-.5-.5H8a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No loans active</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You haven&apos;t added any car loans yet. Add one to get started with tracking.
            </p>
            <Link href="/loans/new" className={buttonVariants()}>
              Add Your First Loan
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userLoans.map((loan) => {
            const original = parseFloat(loan.originalAmount);
            const current = parseFloat(loan.currentBalance);
            const paid = original - current;
            const progress = (paid / original) * 100;
            const monthlyPayment = parseFloat(loan.monthlyPayment);
            const rate = parseFloat(loan.interestRate) * 100;

            return (
              <Card key={loan.id} className="hover:border-primary/50 transition-colors">
                <Link href={`/loans/${loan.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">
                            {loan.vehicleDescription || "Car Loan"}
                          </CardTitle>
                          {loan.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Paid Off</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {loan.lender?.name || "Unknown Lender"} • Started{" "}
                          {format(new Date(loan.startDate), "MMMM yyyy")}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatCurrency(current)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          remaining
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Original Amount</p>
                        <p className="font-medium">{formatCurrency(original)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="font-medium">{formatCurrency(monthlyPayment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{rate.toFixed(2)}% APR</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(paid)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
