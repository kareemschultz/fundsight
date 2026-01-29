import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lenderReviews, lenderStats } from "@/lib/db/schema";
import { eq, and, avg, count, desc } from "drizzle-orm";
import { z } from "zod";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().max(2000).optional(),
  experienceType: z.enum(["application", "repayment", "customer_service", "general"]).default("general"),
});

// GET - Get reviews for a lender
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const reviews = await db.query.lenderReviews.findMany({
      where: eq(lenderReviews.lenderId, id),
      with: {
        user: true,
        votes: true,
      },
      orderBy: [desc(lenderReviews.createdAt)],
    });

    const result = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      reviewText: r.reviewText,
      experienceType: r.experienceType,
      helpfulCount: r.helpfulCount,
      createdAt: r.createdAt,
      user: { id: r.user.id, name: r.user.name },
      hasVoted: session?.user ? r.votes.some((v) => v.userId === session.user.id) : false,
      isOwn: session?.user ? r.userId === session.user.id : false,
    }));

    // Also get stats
    const stats = await db.query.lenderStats.findFirst({
      where: eq(lenderStats.lenderId, id),
    });

    return NextResponse.json({ reviews: result, stats });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - Create a review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: lenderId } = await params;

    const body = await request.json();
    const result = createReviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    // Check if user already reviewed this lender
    const existing = await db.query.lenderReviews.findFirst({
      where: and(
        eq(lenderReviews.lenderId, lenderId),
        eq(lenderReviews.userId, session.user.id)
      ),
    });

    if (existing) {
      // Update existing review
      await db.update(lenderReviews)
        .set({
          rating: result.data.rating,
          reviewText: result.data.reviewText || null,
          experienceType: result.data.experienceType,
        })
        .where(eq(lenderReviews.id, existing.id));
    } else {
      // Create new review
      await db.insert(lenderReviews).values({
        lenderId,
        userId: session.user.id,
        rating: result.data.rating,
        reviewText: result.data.reviewText || null,
        experienceType: result.data.experienceType,
      });
    }

    // Update lender stats
    const [statsResult] = await db
      .select({
        avgRating: avg(lenderReviews.rating),
        totalReviews: count(lenderReviews.id),
      })
      .from(lenderReviews)
      .where(eq(lenderReviews.lenderId, lenderId));

    await db.update(lenderStats)
      .set({
        avgRating: statsResult.avgRating || "0",
        totalReviews: statsResult.totalReviews || 0,
      })
      .where(eq(lenderStats.lenderId, lenderId));

    return NextResponse.json({ message: existing ? "Review updated" : "Review created" }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// DELETE - Delete own review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: lenderId } = await params;

    await db.delete(lenderReviews).where(
      and(
        eq(lenderReviews.lenderId, lenderId),
        eq(lenderReviews.userId, session.user.id)
      )
    );

    // Update stats
    const [statsResult] = await db
      .select({
        avgRating: avg(lenderReviews.rating),
        totalReviews: count(lenderReviews.id),
      })
      .from(lenderReviews)
      .where(eq(lenderReviews.lenderId, lenderId));

    await db.update(lenderStats)
      .set({
        avgRating: statsResult.avgRating || "0",
        totalReviews: statsResult.totalReviews || 0,
      })
      .where(eq(lenderStats.lenderId, lenderId));

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
