import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

/**
 * GET /api/activity/contributions?username=xxx
 * Returns daily contribution counts for the past year (like GitHub's green squares).
 * Public endpoint — no auth required, just pass username.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const rows = await db
      .select({
        date: sql<string>`to_char(${activity.createdAt}::date, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(activity)
      .where(
        and(
          eq(activity.userId, userId),
          gte(activity.createdAt, oneYearAgo)
        )
      )
      .groupBy(sql`${activity.createdAt}::date`)
      .orderBy(sql`${activity.createdAt}::date`);

    // Build a map: date string -> count
    const contributions: Record<string, number> = {};
    for (const row of rows) {
      contributions[row.date] = row.count;
    }

    return NextResponse.json({ contributions });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
