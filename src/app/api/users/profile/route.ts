import { auth } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100).optional(),
    email: z.string().email("Invalid email").optional(),
    // Add other profile fields as needed
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_PROFILE_GET]", error);
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
        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.flatten(), { status: 400 });
        }

        const { name, email } = validation.data;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await db.query.users.findFirst({
                where: (users, { eq, and, ne }) =>
                    and(
                        eq(users.email, email),
                        ne(users.id, session.user.id)
                    ),
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: "Email already in use" },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await db
            .update(users)
            .set({
                ...(name ? { name } : {}),
                ...(email ? { email } : {}),
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
            });

        return NextResponse.json(updatedUser[0]);
    } catch (error) {
        console.error("[USER_PROFILE_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
