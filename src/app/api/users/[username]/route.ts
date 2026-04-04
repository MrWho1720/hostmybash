import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, scripts, activity } from "@/lib/db/schema";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import { eq, and, sql, gte, desc } from "drizzle-orm";

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
      id: scripts.id,
      slug: scripts.slug,
      name: scripts.name,
      description: scripts.description,
      runCount: scripts.runCount,
      starCount: scripts.starCount,
      forkCount: scripts.forkCount,
      updatedAt: scripts.updatedAt,
    })
    .from(scripts)
    .where(
      and(
        eq(scripts.ownerId, user.id),
        eq(scripts.visibility, "public")
      )
    )
    .orderBy(desc(scripts.updatedAt));

  // Aggregate stats
  const [stats] = await db
    .select({
      totalScripts: sql<number>`count(*)::int`,
      totalStars: sql<number>`coalesce(sum(${scripts.starCount}), 0)::int`,
      totalForks: sql<number>`coalesce(sum(${scripts.forkCount}), 0)::int`,
      totalRuns: sql<number>`coalesce(sum(${scripts.runCount}), 0)::int`,
    })
    .from(scripts)
    .where(eq(scripts.ownerId, user.id));

  // Contribution data (last year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const contributionRows = await db
    .select({
      date: sql<string>`to_char(${activity.createdAt}::date, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(activity)
    .where(
      and(
        eq(activity.userId, user.id),
        gte(activity.createdAt, oneYearAgo)
      )
    )
    .groupBy(sql`${activity.createdAt}::date`)
    .orderBy(sql`${activity.createdAt}::date`);

  const contributions: Record<string, number> = {};
  for (const row of contributionRows) {
    contributions[row.date] = row.count;
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? getGravatarUrl(user.email, 200),
    memberSince: user.createdAt,
    stats: {
      scripts: stats?.totalScripts ?? 0,
      stars: stats?.totalStars ?? 0,
      forks: stats?.totalForks ?? 0,
      runs: stats?.totalRuns ?? 0,
    },
    contributions,
    scripts: publicScripts,
  });
}
