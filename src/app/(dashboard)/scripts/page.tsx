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
  updatedAt: string;
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/scripts")
      .then((r) => r.json())
      .then((data) => setScripts(data.scripts || []))
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
      ) : scripts.length === 0 ? (
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
                <h3 className="text-heading font-medium">{s.name}</h3>
                <div className="flex items-center gap-3">
                  {visibilityBadge(s.visibility)}
                  <span className="text-xs text-faint">
                    {s.runCount} runs
                  </span>
                </div>
              </div>
              {s.description && (
                <p className="text-sm text-muted line-clamp-1 mb-2">
                  {s.description}
                </p>
              )}
              <p className="text-xs text-faint font-mono">/{s.slug}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
