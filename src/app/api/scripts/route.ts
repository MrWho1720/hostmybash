import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scripts } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { createScriptSchema } from "@/lib/validation/schemas";
import { trackActivity } from "@/lib/activity";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { user } = await requireAuth();

    const results = await db
      .select()
      .from(scripts)
      .where(eq(scripts.ownerId, user.id))
      .orderBy(desc(scripts.updatedAt));

    return NextResponse.json({ scripts: results });
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

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    const body = await request.json();
    const parsed = createScriptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check slug uniqueness for this user
    const [existing] = await db
      .select({ id: scripts.id })
      .from(scripts)
      .where(
        and(
          eq(scripts.ownerId, user.id),
          eq(scripts.slug, parsed.data.slug)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "You already have a script with this slug" },
        { status: 409 }
      );
    }

    const [script] = await db
      .insert(scripts)
      .values({
        ...parsed.data,
        ownerId: user.id,
      })
      .returning();

    trackActivity({
      userId: user.id,
      type: "created_script",
      scriptId: script.id,
      metadata: { name: script.name, visibility: script.visibility },
    });

    return NextResponse.json({ script }, { status: 201 });
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
