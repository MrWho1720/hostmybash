import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { RESERVED_USERNAMES } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.toLowerCase().trim();

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false, reason: "too_short" });
  }

  if (username.length > 32) {
    return NextResponse.json({ available: false, reason: "too_long" });
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(username)) {
    return NextResponse.json({ available: false, reason: "invalid_format" });
  }

  if (RESERVED_USERNAMES.has(username)) {
    return NextResponse.json({ available: false, reason: "reserved" });
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return NextResponse.json({ available: !existing });
}
