import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { scripts, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> }
) {
  const { username, slug } = await params;

  const [result] = await db
    .select({
      content: scripts.content,
      visibility: scripts.visibility,
      id: scripts.id,
    })
    .from(scripts)
    .innerJoin(users, eq(scripts.ownerId, users.id))
    .where(and(eq(users.username, username.toLowerCase()), eq(scripts.slug, slug)))
    .limit(1);

  if (!result) {
    return new Response("# Script not found\necho 'Error: script not found'\nexit 1\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Private scripts are never served via raw endpoint
  if (result.visibility === "private") {
    return new Response("# Private script\necho 'Error: this script is private'\nexit 1\n", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Increment run count (fire and forget)
  db.update(scripts)
    .set({ runCount: sql`${scripts.runCount} + 1` })
    .where(eq(scripts.id, result.id))
    .then(() => {})
    .catch(() => {});

  return new Response(result.content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
