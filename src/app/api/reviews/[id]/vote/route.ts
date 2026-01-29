import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewVotes, lenderReviews } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

// POST - Vote a review as helpful (toggle)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = await params;

    // Check if already voted
    const existing = await db.query.reviewVotes.findFirst({
      where: and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.userId, session.user.id)
      ),
    });

    if (existing) {
      // Remove vote
      await db.delete(reviewVotes).where(eq(reviewVotes.id, existing.id));
    } else {
      // Add vote
      await db.insert(reviewVotes).values({
        reviewId,
        userId: session.user.id,
      });
    }

    // Update helpful count on the review
    const [voteCount] = await db
      .select({ total: count(reviewVotes.id) })
      .from(reviewVotes)
      .where(eq(reviewVotes.reviewId, reviewId));

    await db.update(lenderReviews)
      .set({ helpfulCount: voteCount.total })
      .where(eq(lenderReviews.id, reviewId));

    return NextResponse.json({
      voted: !existing,
      helpfulCount: voteCount.total,
    });
  } catch (error) {
    console.error("Failed to vote:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
