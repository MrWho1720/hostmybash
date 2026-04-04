import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { cache } from "react";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // lax needed for cross-subdomain cookies
      domain:
        process.env.NODE_ENV === "production"
          ? ".endever.in" // shared across subdomains
          : undefined,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      username: attributes.username,
      displayName: attributes.displayName,
      avatarUrl: attributes.avatarUrl,
      bio: attributes.bio,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      username: string;
      displayName: string;
      display_name: string;
      avatarUrl: string | null;
      avatar_url: string | null;
      bio: string | null;
    };
  }
}

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return { user: null, session: null };

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {
    // Next.js throws when setting cookies in Server Components
  }

  return result;
});

export async function requireAuth() {
  const { user, session } = await getSession();
  if (!user || !session) {
    throw new Error("Unauthorized");
  }
  return { user, session };
}
