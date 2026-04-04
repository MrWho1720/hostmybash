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

function RunIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
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

  const totalRuns = scripts.reduce((acc, s) => acc + s.runCount, 0);
  const totalStars = scripts.reduce((acc, s) => acc + s.starCount, 0);

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-muted)" }}>
            Overview of your scripts and execution metrics.
          </p>
        </div>
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

      {!loading && !error && (
        <>
          {/* Top Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 32 }}>
            <div className="dashboard-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "var(--text-heading)", lineHeight: 1 }}>{scripts.length}</h2>
                <span style={{ fontSize: 14, color: "var(--text-body)" }}>Total Scripts</span>
              </div>
              <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--accent)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                View details <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </p>
            </div>

            <div className="dashboard-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "var(--text-heading)", lineHeight: 1 }}>{totalRuns}</h2>
                <span style={{ fontSize: 14, color: "var(--text-body)" }}>Total Executions</span>
              </div>
              <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                Across all scripts
              </p>
            </div>

            <div className="dashboard-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(59, 130, 246, 0.15)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "var(--text-heading)", lineHeight: 1 }}>{totalStars}</h2>
                <span style={{ fontSize: 14, color: "var(--text-body)" }}>Total Stars</span>
              </div>
              <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                From community
              </p>
            </div>

            {/* Orange Insight Card */}
            <div className="dashboard-card" style={{ padding: "24px", background: "var(--warning)", color: "#fff", border: "none", boxShadow: "0 10px 20px rgba(245, 158, 11, 0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div>
                   <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>System Health</p>
                   <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>All services optimal</p>
                </div>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 48, fontWeight: 700, letterSpacing: "-1px" }}>99.9%</h2>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.9, lineHeight: 1.4 }}>Uptime SLA maintained this month across script execution clusters.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            {/* Scripts Grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--text-heading)" }}>Your Scripts</h3>
                <Link
                  href="/scripts/new"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-body)",
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-muted)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New Script
                </Link>
              </div>

              {scripts.length === 0 ? (
                <div
                  className="dashboard-card"
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    borderStyle: "dashed",
                    background: "transparent"
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {scripts.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => window.location.href = `/scripts/${s.id}`}
                      className="dashboard-card"
                      style={{
                        padding: "20px",
                        cursor: "pointer",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16
                      }}
                    >
                      {/* Script Header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                              {s.name}
                            </h3>
                            <p style={{ margin: 0, fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                              /{s.slug}
                            </p>
                          </div>
                        </div>
                        <VisibilityBadge v={s.visibility} />
                      </div>

                      {/* Script Body */}
                      <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", flex: 1, textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.description || "No description provided."}
                      </p>

                      {/* Script Footer */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: "auto" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--text-faint)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><RunIcon /> {s.runCount}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><StarIcon /> {s.starCount}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ForkIcon /> {s.forkCount}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{timeAgo(s.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity feed */}
            {activity.length > 0 && (
              <div style={{ width: "300px", flexShrink: 0 }}>
                <div className="dashboard-card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-heading)" }}>
                      Recent Activity
                    </h3>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {activity.map((event, i) => {
                      const verb = EVENT_VERBS[event.type] || event.type;
                      const name = event.script?.name ?? (event.metadata?.name as string) ?? "a script";
                      const color = EVENT_COLOR[event.type] || "var(--text-muted)";
                      const isLast = i === activity.length - 1;
                      return (
                        <div key={event.id} style={{ display: "flex", gap: 16, paddingBottom: isLast ? 0 : 20, position: "relative" }}>
                          {/* Timeline line */}
                          {!isLast && (
                            <div style={{ position: "absolute", left: 7, top: 20, bottom: 0, width: 2, background: "var(--border)" }} />
                          )}
                          {/* Dot */}
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 2, position: "relative", zIndex: 1, border: "3px solid var(--bg-surface)" }} />
                          <div style={{ flex: 1, minWidth: 0, background: "var(--bg-elevated)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-body)", lineHeight: 1.4 }}>
                              <span style={{ color: "var(--text-muted)" }}>{verb}</span>{" "}
                              <span style={{ color: "var(--text-heading)", fontWeight: 500 }}>{name}</span>
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)" }}>
                              {timeAgo(event.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
