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

  useEffect(() => {
    fetch("/api/scripts")
      .then((r) => r.json())
      .then((data) => setScripts(data.scripts || []))
      .finally(() => setLoading(false));
  }, []);

  const visibilityBadge = (v: string) => {
    const colors: Record<string, string> = {
      private: "bg-gray-700 text-gray-300",
      public: "bg-green-900 text-green-300",
      unlisted: "bg-yellow-900 text-yellow-300",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[v] || ""}`}>
        {v}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My Scripts</h2>
        <Link
          href="/scripts/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          + New Script
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : scripts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No scripts yet</p>
          <p className="text-sm">Create your first script to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scripts.map((s) => (
            <Link
              key={s.id}
              href={`/scripts/${s.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-medium">{s.name}</h3>
                <div className="flex items-center gap-3">
                  {visibilityBadge(s.visibility)}
                  <span className="text-xs text-gray-500">
                    {s.runCount} runs
                  </span>
                </div>
              </div>
              {s.description && (
                <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                  {s.description}
                </p>
              )}
              <p className="text-xs text-gray-600 font-mono">/{s.slug}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
