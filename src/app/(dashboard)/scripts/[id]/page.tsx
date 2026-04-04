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
  starCount: number;
  forkCount: number;
  forkedFromId: string | null;
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
  const [starred, setStarred] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

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

    // Check star status
    fetch(`/api/scripts/${id}/star`)
      .then((r) => r.json())
      .then((data) => setStarred(data.starred))
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

  async function toggleStar() {
    if (starLoading) return;
    setStarLoading(true);
    try {
      const method = starred ? "DELETE" : "PUT";
      const res = await fetch(`/api/scripts/${id}/star`, { method });
      const data = await res.json();
      setStarred(data.starred);
      if (script) {
        setScript({
          ...script,
          starCount: data.starred ? script.starCount + 1 : Math.max(0, script.starCount - 1),
        });
      }
    } catch {}
    setStarLoading(false);
  }

  async function handleFork() {
    try {
      const res = await fetch(`/api/scripts/${id}/fork`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.script) {
        router.push(`/scripts/${data.script.id}`);
      } else {
        setError(data.error || "Failed to fork");
      }
    } catch {
      setError("Network error");
    }
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
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-heading tracking-tight">{script.name}</h2>
          {script.description && (
            <p className="text-muted mt-1">{script.description}</p>
          )}
          {script.forkedFromId && (
            <p className="text-xs text-faint mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Forked
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-faint">
            <span className="capitalize">{script.visibility}</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {script.starCount}
            </span>
            <span>{script.forkCount} forks</span>
            <span>{script.runCount} runs</span>
            <span className="font-mono">/{script.slug}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleStar}
            disabled={starLoading}
            className={`px-3 py-2 rounded-lg text-sm transition-colors border flex items-center gap-1.5 ${
              starred
                ? "bg-warning/10 border-warning/30 text-warning"
                : "bg-elevated border-edge text-muted hover:text-heading"
            }`}
          >
            <svg className="w-4 h-4" fill={starred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {starred ? "Starred" : "Star"}
          </button>
          <button
            type="button"
            onClick={handleFork}
            className="px-3 py-2 bg-elevated border border-edge text-muted hover:text-heading rounded-lg text-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Fork
          </button>
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="px-3 py-2 bg-elevated border border-edge text-muted hover:text-heading rounded-lg text-sm transition-colors"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-lg text-sm transition-colors"
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
              className="text-xs px-3 py-1 bg-elevated border border-edge text-muted rounded-md hover:text-heading transition-colors"
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
