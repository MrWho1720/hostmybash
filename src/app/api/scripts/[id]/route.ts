import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scripts } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { updateScriptSchema } from "@/lib/validation/schemas";
import { trackActivity } from "@/lib/activity";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const [script] = await db
      .select()
      .from(scripts)
      .where(and(eq(scripts.id, id), eq(scripts.ownerId, user.id)))
      .limit(1);

    if (!script) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ script });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateScriptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // If changing slug, check uniqueness
    if (parsed.data.slug) {
      const [conflict] = await db
        .select({ id: scripts.id })
        .from(scripts)
        .where(
          and(
            eq(scripts.ownerId, user.id),
            eq(scripts.slug, parsed.data.slug)
          )
        )
        .limit(1);

      if (conflict && conflict.id !== id) {
        return NextResponse.json(
          { error: "You already have a script with this slug" },
          { status: 409 }
        );
      }
    }

    const [updated] = await db
      .update(scripts)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(and(eq(scripts.id, id), eq(scripts.ownerId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    trackActivity({
      userId: user.id,
      type: "updated_script",
      scriptId: updated.id,
      metadata: { name: updated.name },
    });

    return NextResponse.json({ script: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const [deleted] = await db
      .delete(scripts)
      .where(and(eq(scripts.id, id), eq(scripts.ownerId, user.id)))
      .returning({ id: scripts.id, name: scripts.name });

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    trackActivity({
      userId: user.id,
      type: "deleted_script",
      scriptId: deleted.id,
      metadata: { name: deleted.name },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
