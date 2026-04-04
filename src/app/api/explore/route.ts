import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scripts, users } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

/**
 * GET /api/explore
 * Query params:
 *   sort = trending | recent | stars | runs (default: trending)
 *   limit = number (default: 20, max: 50)
 *   offset = number (default: 0)
 *   q = search query (optional, searches name + description)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "trending";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const query = searchParams.get("q")?.trim();

    // Base: only public scripts from active users
    let conditions = and(
      eq(scripts.visibility, "public"),
      eq(users.isActive, true)
    );

    // Search filter
    if (query) {
      conditions = and(
        conditions,
        sql`(${scripts.name} ILIKE ${"%" + query + "%"} OR ${scripts.description} ILIKE ${"%" + query + "%"})`
      );
    }

    // Sort order
    let orderBy;
    switch (sort) {
      case "stars":
        orderBy = desc(scripts.starCount);
        break;
      case "runs":
        orderBy = desc(scripts.runCount);
        break;
      case "recent":
        orderBy = desc(scripts.createdAt);
        break;
      case "trending":
      default:
        // Trending = weighted score: stars * 3 + forks * 5 + runs, with recency boost
        orderBy = sql`(${scripts.starCount} * 3 + ${scripts.forkCount} * 5 + ${scripts.runCount}) *
          GREATEST(1.0 - EXTRACT(EPOCH FROM (NOW() - ${scripts.updatedAt})) / 604800.0, 0.1) DESC`;
        break;
    }

    const results = await db
      .select({
        id: scripts.id,
        name: scripts.name,
        slug: scripts.slug,
        description: scripts.description,
        starCount: scripts.starCount,
        forkCount: scripts.forkCount,
        runCount: scripts.runCount,
        createdAt: scripts.createdAt,
        updatedAt: scripts.updatedAt,
        ownerUsername: users.username,
        ownerDisplayName: users.displayName,
        ownerAvatarUrl: users.avatarUrl,
      })
      .from(scripts)
      .innerJoin(users, eq(scripts.ownerId, users.id))
      .where(conditions)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(scripts)
      .innerJoin(users, eq(scripts.ownerId, users.id))
      .where(conditions);

    return NextResponse.json({
      scripts: results,
      total: countResult?.count ?? 0,
      limit,
      offset,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
