import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { lucia } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema, RESERVED_USERNAMES } from "@/lib/validation/schemas";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, username, password, displayName } = parsed.data;

    if (RESERVED_USERNAMES.has(username)) {
      return NextResponse.json(
        { error: "This username is not available" },
        { status: 400 }
      );
    }

    // Check email
    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingEmail) {
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 400 }
      );
    }

    // Check username
    const [existingUsername] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is not available" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        displayName,
      })
      .returning({ id: users.id });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json(
      { message: "Account created", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
