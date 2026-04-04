import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import { eq } from "drizzle-orm";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(64, "Display name must be at most 64 characters"),
  bio: z
    .string()
    .max(300, "Bio must be at most 300 characters")
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .url("Avatar URL must be a valid URL")
    .max(2048)
    .optional()
    .nullable()
    .or(z.literal("")),
});

export async function PUT(request: NextRequest) {
  try {
    const { user } = await requireAuth();

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors },
        { status: 400 }
      );
    }

    const { displayName, bio, avatarUrl } = parsed.data;

    await db
      .update(users)
      .set({
        displayName,
        bio: bio ?? null,
        // Store null if empty string (means "use Gravatar")
        avatarUrl: avatarUrl && avatarUrl.length > 0 ? avatarUrl : null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      displayName,
      bio: bio ?? null,
      avatarUrl:
        avatarUrl && avatarUrl.length > 0
          ? avatarUrl
          : getGravatarUrl(user.email, 160),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
