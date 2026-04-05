"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface ExploreScript {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  starCount: number;
  forkCount: number;
  runCount: number;
  createdAt: string;
  updatedAt: string;
  ownerUsername: string;
  ownerDisplayName: string;
  ownerAvatarUrl: string | null;
}

type SortMode = "trending" | "recent" | "stars" | "runs";

function Avatar({ src, name }: { src: string | null; name: string }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={36}
      height={36}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid var(--border)",
      }}
      onError={() => setErrored(true)}
      unoptimized
    />
  );
}

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

export default function ExplorePage() {
  const [scripts, setScripts] = useState<ExploreScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("trending");
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchScripts = useCallback(async (sortMode: SortMode, search: string, page: number) => {
    setLoading(true);
    const params = new URLSearchParams({
      sort: sortMode,
      limit: "30",
      offset: String(page),
    });
    if (search) params.set("q", search);

    try {
      const res = await fetch(`/api/explore?${params}`);
      const data = await res.json();
      setScripts(data.scripts || []);
      setTotal(data.total || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Single debounced effect for all fetches
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchScripts(sort, query, offset);
    }, query ? 400 : 0);
    return () => clearTimeout(timer);
  }, [sort, query, offset, fetchScripts]);

  const sortTabs: { key: SortMode; label: string }[] = [
    { key: "trending", label: "Trending" },
    { key: "recent", label: "Recent" },
    { key: "stars", label: "Most Starred" },
    { key: "runs", label: "Most Runs" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Hero header */}
      <div style={{ textAlign: "center", paddingTop: 16, paddingBottom: 32 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            color: "var(--text-heading)",
            letterSpacing: "-0.03em",
          }}
        >
          Discover Community Scripts
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 15,
            color: "var(--text-muted)",
          }}
        >
          Browse and search public bash scripts shared by the community
        </p>
      </div>

      {/* Big search bar */}
      <div style={{ maxWidth: 640, margin: "0 auto 24px" }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              color: "var(--text-faint)",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all public scripts..."
            style={{
              width: "100%",
              padding: "14px 20px 14px 48px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text-heading)",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              fontFamily: "var(--font-sans)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <div
        className="overflow-x-auto whitespace-nowrap"
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {sortTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setSort(tab.key); setOffset(0); }}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: sort === tab.key ? 500 : 400,
              color: sort === tab.key ? "var(--accent-text)" : "var(--text-muted)",
              background: "transparent",
              border: "none",
              borderBottom: sort === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1,
              cursor: "pointer",
              transition: "color 0.12s ease",
              fontFamily: "var(--font-sans)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div
            style={{
              width: 24,
              height: 24,
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
            }}
            className="animate-spin"
          />
        </div>
      ) : scripts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            border: "1px dashed var(--border)",
            borderRadius: 12,
            color: "var(--text-faint)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 auto 12px", color: "var(--text-faint)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 500, color: "var(--text-muted)" }}>
            No scripts found
          </p>
          <p style={{ margin: 0, fontSize: 13 }}>
            {query ? "Try a different search term." : "Be the first to publish a public script!"}
          </p>
        </div>
      ) : (
        <>
          {/* 3-column card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: 16,
            }}
          >
            {scripts.map((s) => (
              <Link
                key={s.id}
                href={`/scripts/${s.id}`}
                style={{
                  display: "block",
                  padding: 16,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  textDecoration: "none",
                  transition: "border-color 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-muted)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-surface)";
                }}
              >
                {/* Top row: avatar + owner/name */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <Avatar src={s.ownerAvatarUrl} name={s.ownerDisplayName} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text-heading)",
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 12,
                        color: "var(--text-faint)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      @{s.ownerUsername}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {s.description && (
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {s.description}
                  </p>
                )}

                {/* Stats row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: 12,
                    color: "var(--text-faint)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {s.starCount}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="3" x2="6" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                    {s.forkCount}
                  </span>
                  <span>{s.runCount} runs</span>
                  <span style={{ marginLeft: "auto" }}>{timeAgo(s.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {total > 30 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-faint)" }}>
                Showing {offset + 1}–{Math.min(offset + 30, total)} of {total}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setOffset(Math.max(0, offset - 30))}
                  disabled={offset === 0}
                  style={{
                    padding: "6px 14px",
                    fontSize: 12,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text-muted)",
                    cursor: offset === 0 ? "default" : "pointer",
                    opacity: offset === 0 ? 0.3 : 1,
                    transition: "color 0.12s ease",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + 30)}
                  disabled={offset + 30 >= total}
                  style={{
                    padding: "6px 14px",
                    fontSize: 12,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text-muted)",
                    cursor: offset + 30 >= total ? "default" : "pointer",
                    opacity: offset + 30 >= total ? 0.3 : 1,
                    transition: "color 0.12s ease",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
