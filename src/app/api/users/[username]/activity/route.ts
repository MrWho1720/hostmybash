import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activity, users, scripts } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

/**
 * GET /api/users/:username/activity
 * Public endpoint — returns recent activity for a user.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    // Find user
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const events = await db
      .select({
        id: activity.id,
        type: activity.type,
        scriptId: activity.scriptId,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })
      .from(activity)
      .where(eq(activity.userId, user.id))
      .orderBy(desc(activity.createdAt))
      .limit(limit);

    // Enrich with script info
    const scriptIds = events
      .map((e) => e.scriptId)
      .filter((id): id is string => id !== null);

    let scriptMap: Record<string, { name: string; slug: string }> = {};
    if (scriptIds.length > 0) {
      const scriptRows = await db
        .select({ id: scripts.id, name: scripts.name, slug: scripts.slug })
        .from(scripts)
        .where(inArray(scripts.id, scriptIds));

      for (const s of scriptRows) {
        scriptMap[s.id] = { name: s.name, slug: s.slug };
      }
    }

    const enriched = events.map((e) => ({
      ...e,
      script: e.scriptId ? scriptMap[e.scriptId] ?? null : null,
    }));

    return NextResponse.json({ events: enriched });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
