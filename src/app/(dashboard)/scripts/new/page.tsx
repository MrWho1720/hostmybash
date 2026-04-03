"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 128);
}

export default function NewScriptPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          slug: formData.get("slug"),
          description: formData.get("description") || undefined,
          content: formData.get("content"),
          visibility: formData.get("visibility"),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create script");
        return;
      }

      router.push(`/scripts/${data.script.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">New Script</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Name</label>
          <input
            name="name"
            type="text"
            required
            onChange={(e) => setSlug(toSlug(e.target.value))}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Slug
            <span className="text-gray-500 ml-1">(URL path)</span>
          </label>
          <input
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {slug && (
            <p className="text-xs text-gray-500 mt-1">
              curl https://username.endever.in/{slug} | bash
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Description (optional)
          </label>
          <input
            name="description"
            type="text"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Visibility</label>
          <select
            name="visibility"
            defaultValue="public"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted (accessible via URL only)</option>
            <option value="private">Private (not accessible via curl)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Script Content
          </label>
          <textarea
            name="content"
            required
            rows={16}
            placeholder={"#!/bin/bash\necho 'Hello, World!'"}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <div className="p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-300">
            Warning: Never run scripts from untrusted sources. Always review
            scripts before executing them with curl | bash.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Script"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
