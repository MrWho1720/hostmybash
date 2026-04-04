"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
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
      .then((data) => { if (data.username) setUsername(data.username); })
      .catch(() => { });

    fetch(`/api/scripts/${id}/star`)
      .then((r) => r.json())
      .then((data) => setStarred(data.starred))
      .catch(() => { });
  }, [id]);

  const mainHost = typeof window !== "undefined" ? window.location.hostname : "hostmybash.com";
  const curlCommand = username && script
    ? `bash <(curl -s https://${username}.${mainHost}/${script.slug})`
    : "";

  const lineCount = script ? script.content.split("\n").length : 0;

  function handleCopy() {
    if (!curlCommand) return;
    navigator.clipboard.writeText(curlCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { });
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
    } catch { }
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
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
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

  /* ─── Loading / Error states ─── */
  if (!script && error) {
    return (
      <div style={{ padding: "32px 0", color: "var(--danger)", fontSize: 14 }}>{error}</div>
    );
  }
  if (!script) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
        <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }} className="animate-spin" />
      </div>
    );
  }

  const visibilityColor =
    script.visibility === "public" ? "var(--success)" :
      script.visibility === "private" ? "var(--text-muted)" :
        "var(--warning)";

  /* ─── Shared button style ─── */
  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid var(--border)",
    transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease",
    textDecoration: "none",
    background: "var(--bg-elevated)",
    color: "var(--text-muted)",
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }} className="animate-fade-in">
      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/scripts" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
          Scripts
        </Link>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span style={{ color: "var(--text-heading)", fontWeight: 500 }}>{script.name}</span>
        {script.forkedFromId && (
          <>
            <span style={{ color: "var(--text-faint)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-faint)", fontSize: 12 }}>
              <ForkIcon /> forked
            </span>
          </>
        )}
      </div>

      {/* ── Title + Actions ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
            {script.name}
          </h1>
          {script.description && (
            <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--text-muted)" }}>
              {script.description}
            </p>
          )}
          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text-faint)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: visibilityColor, fontSize: 11, fontWeight: 500 }}>
              {script.visibility}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StarIcon />
              {script.starCount}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ForkIcon />
              {script.forkCount} forks
            </span>
            <span>{script.runCount} runs</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>/{script.slug}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          <button
            type="button"
            onClick={toggleStar}
            disabled={starLoading}
            style={{
              ...btnBase,
              color: starred ? "var(--warning)" : "var(--text-muted)",
              borderColor: starred ? "color-mix(in srgb, var(--warning) 40%, transparent)" : "var(--border)",
              background: starred ? "var(--warning-bg)" : "var(--bg-elevated)",
            }}
          >
            <StarIcon filled={starred} />
            {starred ? "Starred" : "Star"}
          </button>

          <button
            type="button"
            onClick={handleFork}
            style={btnBase}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-heading)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-muted)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
          >
            <ForkIcon />
            Fork
          </button>

          <button
            type="button"
            onClick={() => setEditing(!editing)}
            style={{
              ...btnBase,
              color: editing ? "var(--text-heading)" : "var(--text-muted)",
              borderColor: editing ? "var(--accent)" : "var(--border)",
              background: editing ? "var(--accent-subtle)" : "var(--bg-elevated)",
            }}
          >
            <EditIcon />
            {editing ? "Cancel" : "Edit"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              ...btnBase,
              color: "var(--danger)",
              borderColor: "color-mix(in srgb, var(--danger) 30%, transparent)",
              background: "var(--danger-bg)",
            }}
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ padding: "12px 16px", background: "var(--danger-bg)", border: "1px solid color-mix(in srgb, var(--danger) 40%, transparent)", borderRadius: 8, color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* ── Curl command block ── */}
      {curlCommand && script.visibility !== "private" && (
        <div className="terminal-block" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>bash</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                color: copied ? "var(--success)" : "var(--text-faint)",
                background: "transparent",
                border: "1px solid var(--border)",
                cursor: "pointer",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <code style={{ fontSize: 13, letterSpacing: "0.01em" }}>
            $ {curlCommand}
          </code>
        </div>
      )}

      {/* ── Edit form / Code viewer ── */}
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>Name</label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-script"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>Slug</label>
              <input
                className="input-field"
                value={slug}
                style={{ fontFamily: "var(--font-mono)" }}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-script"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Description</label>
            <input
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Visibility</label>
            <select
              className="input-field"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Script Content</label>
            <textarea
              className="input-field"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              style={{ fontFamily: "var(--font-mono)", fontSize: 13, resize: "vertical", color: "var(--code)" }}
              placeholder="#!/bin/bash"
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
                transition: "background 0.15s ease",
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                fontSize: 13,
                fontWeight: 500,
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ── GitHub file viewer ── */
        <div className="gh-code-block">
          {/* Tab bar */}
          <div className="gh-code-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* File tab */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: "6px 6px 0 0",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderBottom: "1px solid var(--bg-surface)",
                  marginBottom: -1,
                  position: "relative",
                  zIndex: 1,
                  color: "var(--text-body)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                {script.slug}.sh
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span>{lineCount} lines</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(script.content).catch(() => { });
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 8px",
                  borderRadius: 5,
                  fontSize: 11,
                  color: "var(--text-faint)",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                <CopyIcon />
                Raw
              </button>
            </div>
          </div>

          {/* Code body with line numbers */}
          <div style={{ display: "flex", overflowX: "auto" }}>
            {/* Line numbers */}
            <div className="line-numbers">
              {script.content.split("\n").map((_, i) => (
                <span key={i} style={{ lineHeight: "21px" }}>{i + 1}</span>
              ))}
            </div>
            {/* Code content */}
            <pre
              style={{
                flex: 1,
                margin: 0,
                padding: "16px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--code)",
                lineHeight: "21px",
                background: "var(--code-bg)",
                whiteSpace: "pre",
                overflowX: "visible",
                minWidth: 0,
              }}
            >{script.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
