import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, scripts } from "@/lib/db/schema";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

// ─── Data fetching ────────────────────────────────────────
async function getUserProfile(username: string) {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      email: users.email,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  if (!user || !user.isActive) return null;

  const publicScripts = await db
    .select({
      slug: scripts.slug,
      name: scripts.name,
      description: scripts.description,
      runCount: scripts.runCount,
      updatedAt: scripts.updatedAt,
    })
    .from(scripts)
    .where(and(eq(scripts.ownerId, user.id), eq(scripts.visibility, "public")))
    .orderBy(scripts.updatedAt);

  return {
    username: user.username,
    displayName: user.displayName,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? getGravatarUrl(user.email, 200),
    memberSince: user.createdAt,
    scripts: publicScripts,
  };
}

// ─── Metadata ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) {
    return { title: "User not found — HostMyBash" };
  }

  return {
    title: `${profile.displayName} (@${profile.username}) — HostMyBash`,
    description:
      profile.bio ??
      `${profile.displayName}'s public bash scripts on HostMyBash.`,
    openGraph: {
      title: `${profile.displayName} on HostMyBash`,
      description: profile.bio ?? `Browse ${profile.displayName}'s public scripts.`,
      images: [{ url: profile.avatarUrl }],
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────
function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function joinDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────
export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) notFound();

  const MAIN_HOST = process.env.MAIN_HOST || "endever.in";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href={`https://${MAIN_HOST}`}
            className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            HostMyBash
          </Link>
          <Link
            href={`https://${MAIN_HOST}/login`}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Profile card */}
        <section className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={100}
              height={100}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-700"
              unoptimized
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {profile.displayName}
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-0.5">
              @{profile.username}
            </p>

            {profile.bio && (
              <p className="mt-3 text-gray-300 text-sm leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {joinDate(profile.memberSince)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {profile.scripts.length} public{" "}
                {profile.scripts.length === 1 ? "script" : "scripts"}
              </span>
            </div>
          </div>
        </section>

        {/* Scripts list */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Public Scripts</h2>

          {profile.scripts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-xl text-gray-600">
              <p className="text-base">No public scripts yet.</p>
              <p className="text-sm mt-1">Check back later!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {profile.scripts.map((script) => {
                const installUrl = `https://${profile.username}.${MAIN_HOST}/${script.slug}`;
                return (
                  <a
                    key={script.slug}
                    href={installUrl}
                    className="group flex items-start justify-between gap-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                        {script.name}
                      </p>
                      {script.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                          {script.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-700 font-mono mt-1">
                        curl {installUrl} | bash
                      </p>
                    </div>

                    <div className="shrink-0 text-right space-y-1">
                      <p className="text-xs text-gray-500">
                        {script.runCount.toLocaleString()} runs
                      </p>
                      <p className="text-xs text-gray-700">
                        {timeAgo(script.updatedAt)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
          Powered by{" "}
          <a
            href={`https://${MAIN_HOST}`}
            className="hover:text-gray-400 transition-colors"
          >
            HostMyBash
          </a>
        </footer>
      </main>
    </div>
  );
}
