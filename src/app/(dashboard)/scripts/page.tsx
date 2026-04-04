"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Script {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  runCount: number;
  starCount: number;
  forkCount: number;
  updatedAt: string;
  forkedFromId: string | null;
}

interface ActivityEvent {
  id: string;
  type: string;
  metadata: Record<string, string | number> | null;
  createdAt: string;
  script: { name: string; slug: string } | null;
}

const EVENT_VERBS: Record<string, string> = {
  created_script: "Created",
  updated_script: "Updated",
  deleted_script: "Deleted",
  starred_script: "Starred",
  unstarred_script: "Unstarred",
  forked_script: "Forked",
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/scripts").then((r) => r.json()),
      fetch("/api/activity?limit=8").then((r) => r.json()).catch(() => ({ events: [] })),
    ])
      .then(([scriptsData, activityData]) => {
        setScripts(scriptsData.scripts || []);
        setActivity(activityData.events || []);
      })
      .catch(() => setError("Failed to load scripts"))
      .finally(() => setLoading(false));
  }, []);

  const visibilityBadge = (v: string) => {
    const colors: Record<string, string> = {
      private: "bg-elevated text-muted",
      public: "bg-success/15 text-success",
      unlisted: "bg-warning/15 text-warning",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[v] || ""}`}>
        {v}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-heading tracking-tight">My Scripts</h2>
        <Link
          href="/scripts/new"
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Script
        </Link>
      </div>

      {error ? (
        <p className="text-danger">{error}</p>
      ) : loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Scripts list */}
          <div className="flex-1 min-w-0">
            {scripts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-edge rounded-lg text-faint">
                <p className="text-base mb-2">No scripts yet</p>
                <p className="text-sm">Create your first script to get started.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {scripts.map((s) => (
                  <Link
                    key={s.id}
                    href={`/scripts/${s.id}`}
                    className="block bg-surface border border-edge rounded-lg p-4 hover:border-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-heading font-medium">{s.name}</h3>
                        {s.forkedFromId && (
                          <svg className="w-3.5 h-3.5 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {visibilityBadge(s.visibility)}
                      </div>
                    </div>
                    {s.description && (
                      <p className="text-sm text-muted line-clamp-1 mb-2">
                        {s.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-faint">
                      <span className="font-mono">/{s.slug}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {s.starCount}
                      </span>
                      <span>{s.forkCount} forks</span>
                      <span>{s.runCount} runs</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity sidebar */}
          {activity.length > 0 && (
            <div className="w-72 shrink-0 hidden xl:block">
              <h3 className="text-sm font-medium text-heading mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {activity.map((event) => {
                  const verb = EVENT_VERBS[event.type] || event.type;
                  const name = event.script?.name ?? (event.metadata?.name as string) ?? "a script";
                  return (
                    <div key={event.id} className="text-sm">
                      <p className="text-body">
                        <span className="text-muted">{verb}</span>{" "}
                        <span className="text-heading">{name}</span>
                      </p>
                      <p className="text-xs text-faint">{timeAgo(event.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
