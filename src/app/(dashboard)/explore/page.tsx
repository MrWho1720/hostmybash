"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
}

type SortMode = "trending" | "recent" | "stars" | "runs";

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
      limit: "20",
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

  useEffect(() => {
    fetchScripts(sort, query, offset);
  }, [sort, offset, fetchScripts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0);
      fetchScripts(sort, query, 0);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, sort, fetchScripts]);

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

  const sortTabs: { key: SortMode; label: string }[] = [
    { key: "trending", label: "Trending" },
    { key: "recent", label: "Recent" },
    { key: "stars", label: "Most Starred" },
    { key: "runs", label: "Most Runs" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-heading tracking-tight">Explore</h2>
        <p className="text-muted text-sm mt-1">Discover public scripts from the community</p>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scripts..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-edge rounded-lg text-heading text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-faint"
          />
        </div>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 mb-6 border-b border-edge">
        {sortTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setSort(tab.key); setOffset(0); }}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              sort === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-heading"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-edge rounded-lg text-faint">
          <p className="text-base mb-1">No scripts found</p>
          <p className="text-sm">
            {query ? "Try a different search term." : "Be the first to publish a public script!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {scripts.map((s) => (
              <div
                key={s.id}
                className="bg-surface border border-edge rounded-lg p-4 hover:border-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/u/${s.ownerUsername}`}
                        className="text-xs text-muted hover:text-accent font-mono"
                      >
                        @{s.ownerUsername}
                      </Link>
                      <span className="text-faint text-xs">/</span>
                      <span className="text-heading font-medium text-sm">{s.name}</span>
                    </div>
                    {s.description && (
                      <p className="text-sm text-muted line-clamp-2 mb-2">{s.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-faint">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {s.starCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        {s.forkCount}
                      </span>
                      <span>{s.runCount} runs</span>
                      <span>{timeAgo(s.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-edge">
              <p className="text-xs text-faint">
                Showing {offset + 1}–{Math.min(offset + 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - 20))}
                  disabled={offset === 0}
                  className="px-3 py-1.5 text-xs bg-elevated border border-edge rounded-md text-muted hover:text-heading disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + 20)}
                  disabled={offset + 20 >= total}
                  className="px-3 py-1.5 text-xs bg-elevated border border-edge rounded-md text-muted hover:text-heading disabled:opacity-30 transition-colors"
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
