import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scripts, stars } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { trackActivity } from "@/lib/activity";
import { eq, and, sql } from "drizzle-orm";

// PUT = star, DELETE = unstar
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    // Verify script exists and is public or unlisted
    const [script] = await db
      .select({ id: scripts.id, visibility: scripts.visibility, ownerId: scripts.ownerId })
      .from(scripts)
      .where(eq(scripts.id, id))
      .limit(1);

    if (!script) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (script.visibility === "private" && script.ownerId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if already starred
    const [existing] = await db
      .select({ id: stars.id })
      .from(stars)
      .where(and(eq(stars.userId, user.id), eq(stars.scriptId, id)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ starred: true });
    }

    await db.insert(stars).values({ userId: user.id, scriptId: id });

    // Increment star count
    db.update(scripts)
      .set({ starCount: sql`${scripts.starCount} + 1` })
      .where(eq(scripts.id, id))
      .then(() => {})
      .catch(() => {});

    trackActivity({
      userId: user.id,
      type: "starred_script",
      scriptId: id,
      targetUserId: script.ownerId,
    });

    return NextResponse.json({ starred: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const result = await db
      .delete(stars)
      .where(and(eq(stars.userId, user.id), eq(stars.scriptId, id)))
      .returning({ id: stars.id });

    if (result.length > 0) {
      // Decrement star count
      db.update(scripts)
        .set({ starCount: sql`GREATEST(${scripts.starCount} - 1, 0)` })
        .where(eq(scripts.id, id))
        .then(() => {})
        .catch(() => {});

      trackActivity({
        userId: user.id,
        type: "unstarred_script",
        scriptId: id,
      });
    }

    return NextResponse.json({ starred: false });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET = check if current user has starred
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const [existing] = await db
      .select({ id: stars.id })
      .from(stars)
      .where(and(eq(stars.userId, user.id), eq(stars.scriptId, id)))
      .limit(1);

    return NextResponse.json({ starred: !!existing });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
