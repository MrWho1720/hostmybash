import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scripts, forks } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { trackActivity } from "@/lib/activity";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    // Fetch the source script
    const [source] = await db
      .select()
      .from(scripts)
      .where(eq(scripts.id, id))
      .limit(1);

    if (!source) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Can only fork public/unlisted scripts (or your own)
    if (source.visibility === "private" && source.ownerId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Don't allow forking your own script
    if (source.ownerId === user.id) {
      return NextResponse.json(
        { error: "You cannot fork your own script" },
        { status: 400 }
      );
    }

    // Generate a unique slug: try the original, then append -1, -2, etc.
    let forkSlug = source.slug;
    let attempt = 0;
    while (true) {
      const candidate = attempt === 0 ? forkSlug : `${forkSlug}-${attempt}`;
      const [conflict] = await db
        .select({ id: scripts.id })
        .from(scripts)
        .where(and(eq(scripts.ownerId, user.id), eq(scripts.slug, candidate)))
        .limit(1);

      if (!conflict) {
        forkSlug = candidate;
        break;
      }
      attempt++;
      if (attempt > 20) {
        return NextResponse.json(
          { error: "Could not generate unique slug" },
          { status: 409 }
        );
      }
    }

    // Create the forked script
    const [forked] = await db
      .insert(scripts)
      .values({
        ownerId: user.id,
        slug: forkSlug,
        name: source.name,
        description: source.description
          ? `Forked: ${source.description}`
          : null,
        content: source.content,
        visibility: "private", // forks start private
        forkedFromId: source.id,
      })
      .returning();

    // Record the fork relationship
    await db.insert(forks).values({
      sourceScriptId: source.id,
      forkedScriptId: forked.id,
      forkedById: user.id,
    });

    // Increment fork count on source
    db.update(scripts)
      .set({ forkCount: sql`${scripts.forkCount} + 1` })
      .where(eq(scripts.id, source.id))
      .then(() => {})
      .catch(() => {});

    trackActivity({
      userId: user.id,
      type: "forked_script",
      scriptId: forked.id,
      targetUserId: source.ownerId,
      metadata: { sourceScriptId: source.id, sourceName: source.name },
    });

    return NextResponse.json({ script: forked }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
