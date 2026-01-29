import { auth } from "@/lib/auth";
import { db, notifications } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const conditions = [eq(notifications.userId, session.user.id)];
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    const userNotifications = await db.query.notifications.findMany({
      where: and(...conditions),
      orderBy: [desc(notifications.createdAt)],
      limit,
    });

    // Get unread count
    const unreadNotifications = await db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, session.user.id),
        eq(notifications.read, false)
      ),
    });

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: unreadNotifications.length,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
