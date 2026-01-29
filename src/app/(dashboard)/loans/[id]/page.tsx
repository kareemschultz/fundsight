import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db, loans, payments } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Loan Details",
  description: "View loan details, payment history, and progress.",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { id } = await params;

  // Parallel fetching: loan + payments start simultaneously
  // @see vercel-react-best-practices: async-parallel
  const [loan, recentPayments] = await Promise.all([
    db.query.loans.findFirst({
      where: and(eq(loans.id, id), eq(loans.userId, session.user.id)),
      with: { lender: true },
    }),
    db.query.payments.findMany({
      where: and(eq(payments.loanId, id), eq(payments.userId, session.user.id)),
      orderBy: [desc(payments.paymentDate)],
      limit: 20,
    }),
  ]);

  if (!loan) {
    notFound();
  }

  const original = parseFloat(loan.originalAmount);
  const current = parseFloat(loan.currentBalance);
  const paid = original - current;
  const progress = (paid / original) * 100;
  const monthlyPayment = parseFloat(loan.monthlyPayment);
  const rate = parseFloat(loan.interestRate) * 100;

  // Calculate estimated payoff
  const monthlyRate = parseFloat(loan.interestRate) / 12;
  let remainingMonths = 0;
  if (monthlyRate > 0 && monthlyPayment > current * monthlyRate) {
    remainingMonths = Math.ceil(
      Math.log(monthlyPayment / (monthlyPayment - current * monthlyRate)) /
        Math.log(1 + monthlyRate)
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              {loan.vehicleDescription || "Car Loan"}
            </h1>
            {loan.isActive ? (
              <Badge>Active</Badge>
            ) : (
              <Badge variant="secondary">Paid Off</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {loan.lender?.name || "Unknown Lender"} · Started{" "}
            {format(new Date(loan.startDate), "MMMM d, yyyy")}
          </p>
        </div>
        <Link
          href="/loans"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to Loans
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCurrency(current)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Payment</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCurrency(monthlyPayment)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interest Rate</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {rate.toFixed(2)}% APR
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Est. Months Remaining</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {remainingMonths > 0 ? remainingMonths : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Progress</CardTitle>
          <CardDescription>
            {formatCurrency(paid)} paid of {formatCurrency(original)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular-nums">
              <span>$0</span>
              <span>{formatCurrency(original)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-xl font-semibold">Recent Payments</h2>
            <Link
              href={`/tracker?loan=${id}`}
              className={buttonVariants()}
            >
              Record Payment
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">
                  No payments recorded yet.
                </p>
                <Link
                  href={`/tracker?loan=${id}`}
                  className={buttonVariants()}
                >
                  Record First Payment
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(
                          new Date(payment.paymentDate),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {formatCurrency(parseFloat(payment.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.paymentType === "extra"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {payment.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.source}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate hidden sm:table-cell">
                        {payment.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Loan Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Lender</dt>
                  <dd className="font-medium">
                    {loan.lender?.name || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Vehicle</dt>
                  <dd className="font-medium">
                    {loan.vehicleDescription || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Original Amount
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatCurrency(original)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Start Date</dt>
                  <dd className="font-medium">
                    {format(new Date(loan.startDate), "MMMM d, yyyy")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Term Length
                  </dt>
                  <dd className="font-medium">
                    {loan.termMonths
                      ? `${loan.termMonths} months`
                      : "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Monthly Interest Rate
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {(rate / 12).toFixed(3)}%
                  </dd>
                </div>
              </dl>
              {loan.notes ? (
                <div className="mt-6">
                  <dt className="text-sm text-muted-foreground mb-1">Notes</dt>
                  <dd className="text-sm bg-muted p-3 rounded-md">
                    {loan.notes}
                  </dd>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
