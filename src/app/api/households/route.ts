import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { households, householdMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const createHouseholdSchema = z.object({
  name: z.string().min(1).max(100),
});

// GET - List all households user belongs to
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await db.query.householdMembers.findMany({
      where: eq(householdMembers.userId, session.user.id),
      with: {
        household: {
          with: {
            members: {
              with: {
                user: true,
              },
            },
            loans: {
              with: {
                loan: {
                  with: {
                    lender: true,
                  },
                },
                sharer: true,
              },
            },
          },
        },
      },
    });

    const result = memberships.map((m) => ({
      ...m.household,
      myRole: m.role,
      memberCount: m.household.members.length,
      loanCount: m.household.loans.length,
      members: m.household.members.map((mem) => ({
        id: mem.id,
        role: mem.role,
        joinedAt: mem.joinedAt,
        user: {
          id: mem.user.id,
          name: mem.user.name,
          email: mem.user.email,
        },
      })),
      loans: m.household.loans.map((hl) => ({
        id: hl.id,
        sharedAt: hl.sharedAt,
        sharedBy: { id: hl.sharer.id, name: hl.sharer.name },
        loan: hl.loan,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch households:", error);
    return NextResponse.json({ error: "Failed to fetch households" }, { status: 500 });
  }
}

// POST - Create a new household
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createHouseholdSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const inviteCode = generateInviteCode();

    const [household] = await db.insert(households).values({
      name: result.data.name,
      inviteCode,
      createdBy: session.user.id,
    }).returning();

    // Add creator as admin member
    await db.insert(householdMembers).values({
      householdId: household.id,
      userId: session.user.id,
      role: "admin",
    });

    return NextResponse.json(household, { status: 201 });
  } catch (error) {
    console.error("Failed to create household:", error);
    return NextResponse.json({ error: "Failed to create household" }, { status: 500 });
  }
}
