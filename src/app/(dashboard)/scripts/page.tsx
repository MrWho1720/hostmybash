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
  created_script:  "Created",
  updated_script:  "Updated",
  deleted_script:  "Deleted",
  starred_script:  "Starred",
  unstarred_script:"Unstarred",
  forked_script:   "Forked",
};

const EVENT_COLOR: Record<string, string> = {
  created_script:  "var(--success)",
  updated_script:  "var(--accent)",
  deleted_script:  "var(--danger)",
  starred_script:  "var(--warning)",
  unstarred_script:"var(--text-faint)",
  forked_script:   "var(--accent-text)",
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

function VisibilityBadge({ v }: { v: string }) {
  const className =
    v === "public"   ? "badge badge-public" :
    v === "private"  ? "badge badge-private" :
    "badge badge-unlisted";
  return <span className={className}>{v}</span>;
}

function ScriptIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 2 }}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ScriptsPage() {
  const [scripts, setScripts]   = useState<Script[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/scripts").then((r) => r.json()),
      fetch("/api/activity?limit=10").then((r) => r.json()).catch(() => ({ events: [] })),
    ])
      .then(([scriptsData, activityData]) => {
        setScripts(scriptsData.scripts || []);
        setActivity(activityData.events || []);
      })
      .catch(() => setError("Failed to load scripts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
            My Scripts
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
            Manage and deploy your terminal-ready automations.
          </p>
        </div>
        <Link
          href="/scripts/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            transition: "background 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Script
        </Link>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: "12px 16px", background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: 8, color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
          <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }} className="animate-spin" />
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Scripts list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {scripts.length === 0 ? (
              /* Empty state */
              <div
                style={{
                  border: "1px dashed var(--border)",
                  borderRadius: 10,
                  padding: "48px 24px",
                  textAlign: "center",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 500, color: "var(--text-muted)" }}>No scripts yet</p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-faint)" }}>
                  Create your first script to get started.
                </p>
              </div>
            ) : (
              /* Script cards */
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {scripts.map((s, i) => (
                  <Link
                    key={s.id}
                    href={`/scripts/${s.id}`}
                    style={{
                      display: "block",
                      padding: "14px 16px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: i === 0 ? "10px 10px 0 0" : i === scripts.length - 1 ? "0 0 10px 10px" : "0",
                      marginTop: i === 0 ? 0 : -1,
                      textDecoration: "none",
                      transition: "background 0.12s ease, z-index 0s",
                      position: "relative",
                      zIndex: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-elevated)";
                      (e.currentTarget as HTMLAnchorElement).style.zIndex = "1";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-surface)";
                      (e.currentTarget as HTMLAnchorElement).style.zIndex = "0";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <ScriptIcon />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {s.name}
                            </span>
                            {s.forkedFromId && (
                              <span style={{ color: "var(--text-faint)", flexShrink: 0 }}>
                                <ForkIcon />
                              </span>
                            )}
                          </div>
                          <VisibilityBadge v={s.visibility} />
                        </div>

                        {/* Description */}
                        {s.description && (
                          <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.description}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text-faint)" }}>
                          <span style={{ fontFamily: "var(--font-mono)" }}>/{s.slug}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <StarIcon />
                            {s.starCount}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <ForkIcon />
                            {s.forkCount}
                          </span>
                          <span>{s.runCount} runs</span>
                          <span style={{ marginLeft: "auto" }}>{timeAgo(s.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity sidebar */}
          {activity.length > 0 && (
            <div style={{ width: 240, flexShrink: 0 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
                Recent Activity
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {activity.map((event, i) => {
                  const verb = EVENT_VERBS[event.type] || event.type;
                  const name = event.script?.name ?? (event.metadata?.name as string) ?? "a script";
                  const color = EVENT_COLOR[event.type] || "var(--text-muted)";
                  const isLast = i === activity.length - 1;
                  return (
                    <div key={event.id} style={{ display: "flex", gap: 12, paddingBottom: isLast ? 0 : 12, position: "relative" }}>
                      {/* Timeline line */}
                      {!isLast && (
                        <div style={{ position: "absolute", left: 5, top: 14, bottom: 0, width: 1, background: "var(--border)" }} />
                      )}
                      {/* Dot */}
                      <div style={{ width: 11, height: 11, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 3, position: "relative", zIndex: 1 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--text-body)", lineHeight: 1.4 }}>
                          <span style={{ color: "var(--text-muted)" }}>{verb}</span>{" "}
                          <span style={{ color: "var(--text-heading)", fontWeight: 500 }}>{name}</span>
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                          {timeAgo(event.createdAt)}
                        </p>
                      </div>
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
