"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const EVENT_COLOR: Record<string, string> = {
  created_script: "var(--success)",
  updated_script: "var(--accent)",
  deleted_script: "var(--danger)",
  starred_script: "var(--warning)",
  unstarred_script: "var(--text-faint)",
  forked_script: "var(--accent-text)",
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created_script: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16m8-8H4" />
    </svg>
  ),
  updated_script: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  deleted_script: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  starred_script: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  unstarred_script: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  forked_script: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Activity" },
  { value: "created_script", label: "Created" },
  { value: "updated_script", label: "Updated" },
  { value: "deleted_script", label: "Deleted" },
  { value: "starred_script", label: "Starred" },
  { value: "forked_script", label: "Forked" },
];

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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByDate(events: ActivityEvent[]): Record<string, ActivityEvent[]> {
  const groups: Record<string, ActivityEvent[]> = {};
  for (const event of events) {
    const key = new Date(event.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }
  return groups;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchEvents = (offset = 0, append = false) => {
    const setter = append ? setLoadingMore : setLoading;
    setter(true);
    fetch(`/api/activity?limit=30&offset=${offset}`)
      .then((r) => r.json())
      .then((data) => {
        const newEvents = data.events || [];
        if (newEvents.length < 30) setHasMore(false);
        setEvents((prev) => (append ? [...prev, ...newEvents] : newEvents));
      })
      .catch(() => {})
      .finally(() => setter(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const grouped = groupByDate(filtered);

  // Stats
  const todayStr = new Date().toDateString();
  const todayCount = events.filter((e) => new Date(e.createdAt).toDateString() === todayStr).length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekCount = events.filter((e) => new Date(e.createdAt).getTime() > weekAgo).length;
  const typeCounts: Record<string, number> = {};
  for (const e of events) {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  }

  return (
    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", paddingBottom: 40 }} className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
            Activity
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-muted)" }}>
            Your complete activity history across all scripts.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div className="dashboard-card" style={{ padding: "16px 20px" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Today</p>
          <p className="animate-count" style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "var(--text-heading)", lineHeight: 1 }}>{todayCount}</p>
        </div>
        <div className="dashboard-card" style={{ padding: "16px 20px" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>This Week</p>
          <p className="animate-count" style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "var(--text-heading)", lineHeight: 1 }}>{weekCount}</p>
        </div>
        <div className="dashboard-card" style={{ padding: "16px 20px" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Events</p>
          <p className="animate-count" style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "var(--text-heading)", lineHeight: 1 }}>{events.length}{hasMore ? "+" : ""}</p>
        </div>
        <div className="dashboard-card" style={{ padding: "16px 20px" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Most Common</p>
          <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, color: "var(--text-heading)", lineHeight: 1.4 }}>
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]
              ? EVENT_VERBS[Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]] || "—"
              : "—"}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                background: active ? "var(--accent)" : "var(--bg-surface)",
                color: active ? "#fff" : "var(--text-muted)",
                border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
              {opt.value !== "all" && typeCounts[opt.value] ? (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>
                  {typeCounts[opt.value]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }} className="animate-spin" />
        </div>
      )}

      {/* Activity Timeline */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="dashboard-card" style={{ padding: "48px 24px", textAlign: "center", borderStyle: "dashed", background: "transparent" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 500, color: "var(--text-muted)" }}>No activity yet</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-faint)" }}>
                {filter !== "all" ? "No events match this filter." : "Start creating and managing scripts to see your activity here."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {Object.entries(grouped).map(([dateLabel, dateEvents]) => (
                <div key={dateLabel}>
                  {/* Date Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {dateLabel}
                    </h3>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                      {dateEvents.length} event{dateEvents.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Events for this date */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingLeft: 4 }}>
                    {dateEvents.map((event, i) => {
                      const verb = EVENT_VERBS[event.type] || event.type;
                      const name = event.script?.name ?? (event.metadata?.name as string) ?? "a script";
                      const slug = event.script?.slug;
                      const color = EVENT_COLOR[event.type] || "var(--text-muted)";
                      const icon = EVENT_ICONS[event.type];
                      const isLast = i === dateEvents.length - 1;

                      return (
                        <div key={event.id} className="animate-timeline-entry" style={{ display: "flex", gap: 16, paddingBottom: isLast ? 0 : 4, position: "relative" }}>
                          {/* Timeline line */}
                          {!isLast && (
                            <div style={{ position: "absolute", left: 15, top: 36, bottom: 0, width: 2, background: "var(--border)" }} />
                          )}
                          {/* Icon circle */}
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "var(--bg-surface)", border: "2px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, position: "relative", zIndex: 1, color,
                          }}>
                            {icon || <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
                          </div>

                          {/* Content card */}
                          <div
                            className="dashboard-card"
                            style={{
                              flex: 1, padding: "14px 18px", marginBottom: 8,
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 14, color: "var(--text-body)", lineHeight: 1.4 }}>
                                <span style={{ color, fontWeight: 600 }}>{verb}</span>{" "}
                                {slug ? (
                                  <Link
                                    href={`/scripts/${slug}`}
                                    style={{ color: "var(--text-heading)", fontWeight: 500, textDecoration: "none" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {name}
                                  </Link>
                                ) : (
                                  <span style={{ color: "var(--text-heading)", fontWeight: 500 }}>{name}</span>
                                )}
                              </p>
                            </div>
                            <span style={{ fontSize: 12, color: "var(--text-faint)", whiteSpace: "nowrap", flexShrink: 0 }}>
                              {formatDate(event.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && filtered.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button
                onClick={() => fetchEvents(events.length, true)}
                disabled={loadingMore}
                style={{
                  padding: "10px 28px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "var(--bg-surface)",
                  color: "var(--text-body)",
                  border: "1px solid var(--border)",
                  cursor: loadingMore ? "default" : "pointer",
                  opacity: loadingMore ? 0.6 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
