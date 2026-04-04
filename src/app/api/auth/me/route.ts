import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getGravatarUrl } from "@/lib/auth/gravatar";

export async function GET() {
  try {
    const { user } = await requireAuth();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio ?? null,
      avatarUrl: user.avatarUrl ?? getGravatarUrl(user.email, 160),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
