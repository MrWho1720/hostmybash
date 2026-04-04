import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activity, users, scripts } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, desc, sql, inArray } from "drizzle-orm";

/**
 * GET /api/activity
 * Returns activity feed for the authenticated user.
 * Query params:
 *   limit = number (default: 30, max: 50)
 *   offset = number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    const events = await db
      .select({
        id: activity.id,
        type: activity.type,
        scriptId: activity.scriptId,
        targetUserId: activity.targetUserId,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })
      .from(activity)
      .where(eq(activity.userId, user.id))
      .orderBy(desc(activity.createdAt))
      .limit(limit)
      .offset(offset);

    // Enrich with script names for events that reference scripts
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
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
