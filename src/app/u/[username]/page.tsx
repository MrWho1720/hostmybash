import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, scripts, activity } from "@/lib/db/schema";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import { eq, and, sql, gte, desc } from "drizzle-orm";
import type { Metadata } from "next";
import ContributionGraph from "@/app/components/ContributionGraph";
import ActivityFeed from "@/app/components/ActivityFeed";

interface Props {
  params: Promise<{ username: string }>;
}

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
      starCount: scripts.starCount,
      forkCount: scripts.forkCount,
      updatedAt: scripts.updatedAt,
    })
    .from(scripts)
    .where(and(eq(scripts.ownerId, user.id), eq(scripts.visibility, "public")))
    .orderBy(desc(scripts.updatedAt));

  // Stats
  const [stats] = await db
    .select({
      totalScripts: sql<number>`count(*)::int`,
      totalStars: sql<number>`coalesce(sum(${scripts.starCount}), 0)::int`,
      totalRuns: sql<number>`coalesce(sum(${scripts.runCount}), 0)::int`,
    })
    .from(scripts)
    .where(eq(scripts.ownerId, user.id));

  // Contributions (last year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const contributionRows = await db
    .select({
      date: sql<string>`to_char(${activity.createdAt}::date, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(activity)
    .where(and(eq(activity.userId, user.id), gte(activity.createdAt, oneYearAgo)))
    .groupBy(sql`${activity.createdAt}::date`)
    .orderBy(sql`${activity.createdAt}::date`);

  const contributions: Record<string, number> = {};
  for (const row of contributionRows) {
    contributions[row.date] = row.count;
  }

  // Recent activity
  const recentActivity = await db
    .select({
      id: activity.id,
      type: activity.type,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
    })
    .from(activity)
    .where(eq(activity.userId, user.id))
    .orderBy(desc(activity.createdAt))
    .limit(15);

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? getGravatarUrl(user.email, 200),
    memberSince: user.createdAt,
    stats: {
      scripts: stats?.totalScripts ?? 0,
      stars: stats?.totalStars ?? 0,
      runs: stats?.totalRuns ?? 0,
    },
    contributions,
    recentActivity,
    scripts: publicScripts,
  };
}

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

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) notFound();

  const MAIN_HOST = process.env.MAIN_HOST || "endever.in";

  return (
    <div className="min-h-screen bg-page text-heading">
      {/* Top bar */}
      <header className="border-b border-edge bg-surface/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href={`https://${MAIN_HOST}`}
            className="text-sm font-semibold text-body hover:text-heading transition-colors"
          >
            HostMyBash
          </Link>
          <Link
            href={`https://${MAIN_HOST}/login`}
            className="text-sm text-muted hover:text-heading transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column: profile */}
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-20">
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                width={200}
                height={200}
                className="w-48 h-48 rounded-full object-cover ring-1 ring-edge mx-auto lg:mx-0"
                unoptimized
              />

              <div className="mt-4">
                <h1 className="text-xl font-semibold text-heading leading-tight tracking-tight">
                  {profile.displayName}
                </h1>
                <p className="text-muted font-mono text-sm mt-0.5">
                  @{profile.username}
                </p>
              </div>

              {profile.bio && (
                <p className="mt-3 text-body text-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="text-heading font-medium">{profile.stats.scripts}</span>
                <span className="text-muted -ml-3">scripts</span>
                <span className="text-heading font-medium">{profile.stats.stars}</span>
                <span className="text-muted -ml-3">stars</span>
                <span className="text-heading font-medium">{profile.stats.runs}</span>
                <span className="text-muted -ml-3">runs</span>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-faint">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {joinDate(profile.memberSince)}
              </div>
            </div>
          </div>

          {/* Right column: content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Contribution graph */}
            <section className="bg-surface border border-edge rounded-lg p-5">
              <ContributionGraph contributions={profile.contributions} />
            </section>

            {/* Public Scripts */}
            <section>
              <h2 className="text-base font-semibold text-heading mb-4">
                Public Scripts
                <span className="ml-2 text-xs font-normal text-faint bg-elevated px-2 py-0.5 rounded-full">
                  {profile.scripts.length}
                </span>
              </h2>

              {profile.scripts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-edge rounded-lg text-faint">
                  <p className="text-sm">No public scripts yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {profile.scripts.map((script) => {
                    const installUrl = `https://${profile.username}.${MAIN_HOST}/${script.slug}`;
                    return (
                      <a
                        key={script.slug}
                        href={installUrl}
                        className="group bg-surface border border-edge hover:border-muted/30 rounded-lg px-5 py-4 transition-colors block"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-heading group-hover:text-accent transition-colors truncate text-sm">
                              {script.name}
                            </p>
                            {script.description && (
                              <p className="text-sm text-faint mt-0.5 line-clamp-1">
                                {script.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-faint">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                {script.starCount}
                              </span>
                              <span>{script.forkCount} forks</span>
                              <span>{script.runCount.toLocaleString()} runs</span>
                              <span>{timeAgo(script.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent Activity */}
            {profile.recentActivity.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-heading mb-4">Recent Activity</h2>
                <ActivityFeed events={profile.recentActivity} />
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 mt-8 border-t border-edge text-center text-xs text-faint">
          Powered by{" "}
          <a
            href={`https://${MAIN_HOST}`}
            className="hover:text-muted transition-colors"
          >
            HostMyBash
          </a>
        </footer>
      </main>
    </div>
  );
}
