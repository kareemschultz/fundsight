import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db, payments, loans } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { TrackerClient } from "./tracker-client";

export const metadata: Metadata = {
  title: "Payment Tracker",
  description: "Record and track your loan payments with categorized sources.",
};

export default async function TrackerPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const [userLoans, userPayments] = await Promise.all([
    db.query.loans.findMany({
      where: eq(loans.userId, session.user.id),
      with: {
        lender: true,
      },
    }),
    db.query.payments.findMany({
      where: eq(payments.userId, session.user.id),
      with: {
        loan: {
          with: {
            lender: true,
          }
        },
      },
      orderBy: [desc(payments.paymentDate)],
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Tracker</h1>
          <p className="text-muted-foreground">
            Record and view your loan payments
          </p>
        </div>
      </div>

      <TrackerClient
        initialLoans={userLoans}
        initialPayments={userPayments}
      />
    </div>
  );
}
