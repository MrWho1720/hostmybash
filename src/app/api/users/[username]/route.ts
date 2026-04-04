import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, scripts } from "@/lib/db/schema";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      email: users.email,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const publicScripts = await db
    .select({
      slug: scripts.slug,
      name: scripts.name,
      description: scripts.description,
      runCount: scripts.runCount,
      updatedAt: scripts.updatedAt,
    })
    .from(scripts)
    .where(
      and(
        eq(scripts.ownerId, user.id),
        eq(scripts.visibility, "public")
      )
    )
    .orderBy(scripts.updatedAt);

  return NextResponse.json({
    username: user.username,
    displayName: user.displayName,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? getGravatarUrl(user.email, 200),
    memberSince: user.createdAt,
    scripts: publicScripts,
  });
}
