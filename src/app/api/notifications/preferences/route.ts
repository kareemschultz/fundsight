import { auth } from "@/lib/auth";
import { db, notificationPreferences } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const preferencesSchema = z.object({
  paymentReminders: z.boolean().optional(),
  milestoneAlerts: z.boolean().optional(),
  financialInsights: z.boolean().optional(),
  gratuityReminders: z.boolean().optional(),
  systemNotifications: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, session.user.id),
    });

    if (!prefs) {
      const [newPrefs] = await db
        .insert(notificationPreferences)
        .values({ userId: session.user.id })
        .returning();
      prefs = newPrefs;
    }

    return NextResponse.json(prefs);
  } catch (error) {
    console.error("[NOTIFICATION_PREFS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = preferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.flatten(), { status: 400 });
    }

    const existing = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, session.user.id),
    });

    let result;
    if (existing) {
      [result] = await db
        .update(notificationPreferences)
        .set({ ...validation.data, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, session.user.id))
        .returning();
    } else {
      [result] = await db
        .insert(notificationPreferences)
        .values({ userId: session.user.id, ...validation.data })
        .returning();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[NOTIFICATION_PREFS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
