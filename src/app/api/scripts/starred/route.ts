import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scripts, stars, users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/scripts/starred
 * Returns all scripts the authenticated user has starred.
 */
export async function GET() {
  try {
    const { user } = await requireAuth();

    const results = await db
      .select({
        id: scripts.id,
        name: scripts.name,
        slug: scripts.slug,
        description: scripts.description,
        starCount: scripts.starCount,
        forkCount: scripts.forkCount,
        runCount: scripts.runCount,
        visibility: scripts.visibility,
        createdAt: scripts.createdAt,
        ownerUsername: users.username,
        ownerDisplayName: users.displayName,
        starredAt: stars.createdAt,
      })
      .from(stars)
      .innerJoin(scripts, eq(stars.scriptId, scripts.id))
      .innerJoin(users, eq(scripts.ownerId, users.id))
      .where(eq(stars.userId, user.id))
      .orderBy(desc(stars.createdAt));

    return NextResponse.json({ scripts: results });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
