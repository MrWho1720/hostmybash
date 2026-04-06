"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StarredScript {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  starCount: number;
  forkCount: number;
  runCount: number;
  visibility: string;
  ownerUsername: string;
  ownerDisplayName: string;
  starredAt: string;
}

export default function StarredPage() {
  const [scripts, setScripts] = useState<StarredScript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scripts/starred")
      .then((r) => r.json())
      .then((data) => setScripts(data.scripts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-heading tracking-tight">Starred Scripts</h2>
        <p className="text-muted text-sm mt-1">Scripts you've starred for quick access</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-edge rounded-lg text-faint">
          <p className="text-base mb-2">No starred scripts</p>
          <p className="text-sm">
            Star scripts from the{" "}
            <Link href="/explore" className="text-accent hover:text-accent-hover">
              Explore
            </Link>{" "}
            page to save them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {scripts.map((s) => (
            <Link
              key={s.id}
              href={`/scripts/${s.id}`}
              className="block bg-surface border border-edge rounded-lg p-4 hover:border-muted/30 transition-colors"
              style={{ textDecoration: "none" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted font-mono">@{s.ownerUsername}</span>
                    <span className="text-faint text-xs">/</span>
                    <span className="text-heading font-medium text-sm">{s.name}</span>
                  </div>
                  {s.description && (
                    <p className="text-sm text-muted line-clamp-1 mb-2">{s.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-faint">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {s.starCount}
                    </span>
                    <span>{s.runCount} runs</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
