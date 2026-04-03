import { NextResponse } from "next/server";
import { lucia, getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const { session } = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await lucia.invalidateSession(session.id);
    const blankCookie = lucia.createBlankSessionCookie();
    const cookieStore = await cookies();
    cookieStore.set(
      blankCookie.name,
      blankCookie.value,
      blankCookie.attributes
    );

    return NextResponse.json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
