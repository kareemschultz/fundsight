import { auth } from "@/lib/auth";
import {
  db,
  loans,
  financialProfiles,
  payments,
  notifications,
  notificationPreferences,
} from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const [userLoans, userProfile, , prefs, recentNotifs] =
      await Promise.all([
        db.query.loans.findMany({
          where: eq(loans.userId, userId),
          with: { lender: true },
        }),
        db.query.financialProfiles.findFirst({
          where: eq(financialProfiles.userId, userId),
        }),
        db.query.payments.findMany({
          where: eq(payments.userId, userId),
          orderBy: (p, { desc: d }) => [d(p.paymentDate)],
          limit: 50,
        }),
        db.query.notificationPreferences.findFirst({
          where: eq(notificationPreferences.userId, userId),
        }),
        db.query.notifications.findMany({
          where: eq(notifications.userId, userId),
          orderBy: [desc(notifications.createdAt)],
          limit: 20,
        }),
      ]);

    // Check if this notification type was already sent recently (within 7 days)
    const recentTitles = new Set(
      recentNotifs
        .filter(
          (n) =>
            Date.now() - new Date(n.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
        )
        .map((n) => n.title)
    );

    const newNotifications: Array<{
      userId: string;
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
    }> = [];

    const activeLoans = userLoans.filter((l) => l.isActive);

    // 1. Payment Reminders
    if (!prefs || prefs.paymentReminders) {
      activeLoans.forEach((loan) => {
        const startDate = new Date(loan.startDate);
        const paymentDay = startDate.getDate();
        const now = new Date();
        const daysUntilPayment =
          paymentDay >= now.getDate()
            ? paymentDay - now.getDate()
            : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
              now.getDate() +
              paymentDay;

        if (daysUntilPayment <= 5 && daysUntilPayment > 0) {
          const title = `Payment Due Soon — ${loan.vehicleDescription || "Loan"}`;
          if (!recentTitles.has(title)) {
            newNotifications.push({
              userId,
              type: "payment_reminder",
              title,
              message: `Your $${parseFloat(loan.monthlyPayment).toLocaleString()} payment to ${loan.lender?.shortName || "your lender"} is due in ${daysUntilPayment} day${daysUntilPayment > 1 ? "s" : ""}.`,
              actionUrl: `/loans/${loan.id}`,
            });
          }
        }
      });
    }

    // 2. Milestone Alerts
    if (!prefs || prefs.milestoneAlerts) {
      activeLoans.forEach((loan) => {
        const progress =
          ((parseFloat(loan.originalAmount) -
            parseFloat(loan.currentBalance)) /
            parseFloat(loan.originalAmount)) *
          100;

        const milestones = [25, 50, 75, 90];
        for (const m of milestones) {
          if (progress >= m && progress < m + 2) {
            const title = `🎉 ${m}% Milestone — ${loan.vehicleDescription || "Loan"}`;
            if (!recentTitles.has(title)) {
              newNotifications.push({
                userId,
                type: "milestone",
                title,
                message: `You've paid off ${progress.toFixed(1)}% of your ${loan.vehicleDescription || "loan"}! ${m >= 75 ? "Almost there!" : "Keep going!"}`,
                actionUrl: `/loans/${loan.id}`,
              });
            }
          }
        }
      });
    }

    // 3. Gratuity Reminders
    if ((!prefs || prefs.gratuityReminders) && userProfile?.nextGratuityDate) {
      const daysUntil = Math.ceil(
        (new Date(userProfile.nextGratuityDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntil > 0 && daysUntil <= 14) {
        const title = "Gratuity Coming Soon";
        if (!recentTitles.has(title)) {
          newNotifications.push({
            userId,
            type: "gratuity_reminder",
            title,
            message: `Your gratuity of $${parseFloat(userProfile.expectedGratuity || "0").toLocaleString()} is expected in ~${daysUntil} days. Consider applying it to your highest-interest loan.`,
            actionUrl: "/planning",
          });
        }
      }
    }

    // Insert new notifications
    if (newNotifications.length > 0) {
      await db.insert(notifications).values(newNotifications);
    }

    return NextResponse.json({
      generated: newNotifications.length,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GENERATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
