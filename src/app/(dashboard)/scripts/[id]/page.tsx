"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Script {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  visibility: string;
  runCount: number;
}

export default function ScriptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");

  useEffect(() => {
    fetch(`/api/scripts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.script) {
          setScript(data.script);
          setName(data.script.name);
          setSlug(data.script.slug);
          setDescription(data.script.description || "");
          setContent(data.script.content);
          setVisibility(data.script.visibility);
        } else {
          setError(data.error || "Script not found");
        }
      })
      .catch(() => setError("Failed to load script"));

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.username) setUsername(data.username);
      })
      .catch(() => {});
  }, [id]);

  const mainHost = typeof window !== "undefined" ? window.location.hostname : "endever.in";
  const curlCommand = username && script
    ? `bash <(curl -s https://${username}.${mainHost}/${script.slug})`
    : "";

  function handleCopy() {
    if (!curlCommand) return;
    navigator.clipboard.writeText(curlCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/scripts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description: description || undefined, content, visibility }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }

      setScript(data.script);
      setEditing(false);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this script permanently?")) return;
    const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/scripts");
  }

  if (!script && error) return <p className="text-danger">{error}</p>;
  if (!script) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-heading tracking-tight">{script.name}</h2>
          {script.description && (
            <p className="text-muted mt-1">{script.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-faint">
            <span className="capitalize">{script.visibility}</span>
            <span>{script.runCount} runs</span>
            <span className="font-mono">/{script.slug}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-elevated hover:bg-elevated/80 text-muted rounded-lg text-sm transition-colors border border-edge"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      {/* Curl command */}
      {curlCommand && script.visibility !== "private" && (
        <div className="mb-6 bg-surface border border-edge rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Run this script:</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs px-3 py-1 bg-elevated hover:bg-elevated/80 text-muted rounded-md transition-colors border border-edge"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <code className="block text-sm text-code font-mono bg-page rounded-md p-3">
            {curlCommand}
          </code>
        </div>
      )}

      {editing ? (
        /* Edit mode */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-edge rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full px-4 py-2.5 bg-surface border border-edge rounded-lg text-heading font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-body mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-edge rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-body mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-edge rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-body mb-1">Script Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 bg-surface border border-edge rounded-lg text-code font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      ) : (
        /* View mode */
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-elevated text-xs text-faint font-mono border-b border-edge">
            {script.slug}.sh
          </div>
          <pre className="p-4 text-sm text-code font-mono overflow-x-auto whitespace-pre-wrap">
            {script.content}
          </pre>
        </div>
      )}
    </div>
  );
}
