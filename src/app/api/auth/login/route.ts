import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { lucia } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/schemas";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { code: "NO_ACCOUNT", error: "No account found with that email address" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { code: "DEACTIVATED", error: "This account has been deactivated" },
        { status: 403 }
      );
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { code: "WRONG_PASSWORD", error: "Incorrect password" },
        { status: 401 }
      );
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json({
      message: "Logged in",
      userId: user.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
