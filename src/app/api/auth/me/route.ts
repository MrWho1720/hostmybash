import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await requireAuth();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
