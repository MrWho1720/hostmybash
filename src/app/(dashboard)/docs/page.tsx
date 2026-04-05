"use client";

import { useState } from "react";
import Link from "next/link";

const sections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "scripts", label: "Scripts" },
  { id: "running-scripts", label: "Running Scripts" },
  { id: "visibility", label: "Visibility & Access" },
  { id: "starring", label: "Starring Scripts" },
  { id: "forking", label: "Forking Scripts" },
  { id: "explore", label: "Explore & Discovery" },
  { id: "profile", label: "Public Profile" },
  { id: "activity", label: "Activity Tracking" },
  { id: "settings", label: "Account Settings" },
  { id: "api", label: "API Reference" },
  { id: "limits", label: "Limits & Constraints" },
  { id: "keyboard", label: "Tips & Shortcuts" },
];

function CodeBlock({ children, copyable = true }: { children: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ position: "relative", marginTop: 8, marginBottom: 16 }}>
      <pre
        style={{
          background: "var(--bg-inset)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "14px 18px",
          fontSize: 13,
          lineHeight: 1.6,
          overflowX: "auto",
          color: "var(--text-heading)",
          fontFamily: "var(--font-mono)",
          margin: 0,
        }}
      >
        {children}
      </pre>
      {copyable && (
        <button
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            background: copied ? "var(--success)" : "var(--bg-surface)",
            color: copied ? "#fff" : "var(--text-muted)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}

function InlineCode({ children }: { children: string }) {
  return (
    <code
      style={{
        background: "var(--bg-inset)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        padding: "2px 6px",
        fontSize: "0.88em",
        fontFamily: "var(--font-mono)",
        color: "var(--accent-text)",
      }}
    >
      {children}
    </code>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      style={{
        margin: "48px 0 16px",
        fontSize: 20,
        fontWeight: 700,
        color: "var(--text-heading)",
        letterSpacing: "-0.01em",
        scrollMarginTop: 100,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 4,
          height: 24,
          borderRadius: 2,
          background: "var(--accent)",
          flexShrink: 0,
        }}
      />
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: "28px 0 12px",
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-heading)",
      }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--text-body)", lineHeight: 1.7 }}>
      {children}
    </p>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul style={{ margin: "0 0 16px", paddingLeft: 20, fontSize: 14, color: "var(--text-body)", lineHeight: 1.8 }}>
      {children}
    </ul>
  );
}

function ApiRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  const methodColor: Record<string, string> = {
    GET: "var(--success)",
    POST: "var(--accent)",
    PUT: "var(--warning)",
    DELETE: "var(--danger)",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
        fontSize: 13,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: methodColor[method] || "var(--text-muted)",
          width: 52,
          textAlign: "center",
          flexShrink: 0,
          background: "var(--bg-inset)",
          padding: "3px 0",
          borderRadius: 4,
        }}
      >
        {method}
      </span>
      <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-heading)", fontSize: 13, flexShrink: 0 }}>
        {path}
      </code>
      <span style={{ color: "var(--text-muted)", marginLeft: "auto", textAlign: "right" }}>{desc}</span>
    </div>
  );
}

function Callout({ type = "info", children }: { type?: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; border: string; icon: React.ReactNode; color: string }> = {
    info: {
      bg: "color-mix(in srgb, var(--accent) 8%, transparent)",
      border: "color-mix(in srgb, var(--accent) 30%, transparent)",
      color: "var(--accent-text)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
    warning: {
      bg: "color-mix(in srgb, var(--warning) 10%, transparent)",
      border: "color-mix(in srgb, var(--warning) 30%, transparent)",
      color: "var(--warning)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    tip: {
      bg: "color-mix(in srgb, var(--success) 8%, transparent)",
      border: "color-mix(in srgb, var(--success) 30%, transparent)",
      color: "var(--success)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
  };

  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "12px 16px", margin: "12px 0 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ color: s.color, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
      <div style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 animate-fade-in" style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Sidebar Table of Contents */}
      <nav
        className="hidden md:block"
        style={{
          width: 220,
          flexShrink: 0,
          position: "sticky",
          top: 80,
          alignSelf: "flex-start",
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
        }}
      >
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-faint)",
          }}
        >
          On this page
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activeSection === s.id ? 600 : 400,
                color: activeSection === s.id ? "var(--text-heading)" : "var(--text-muted)",
                background: activeSection === s.id ? "var(--bg-surface)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
                borderLeft: activeSection === s.id ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
            Documentation
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Everything you need to know about hosting, sharing, and running bash scripts with HostMyBash.
          </p>
        </div>

        {/* ─── Getting Started ─── */}
        <SectionHeading id="getting-started">Getting Started</SectionHeading>
        <P>
          HostMyBash is a platform for hosting, sharing, and executing bash scripts.
          Create an account, write your script, and share it with a single <InlineCode>curl</InlineCode> command.
        </P>

        <SubHeading>Quick Start</SubHeading>
        <Ul>
          <li>Sign up with your email and pick a unique username</li>
          <li>Navigate to <strong>Dashboard</strong> and click <strong>New Script</strong></li>
          <li>Write or paste your bash script</li>
          <li>Set visibility to <strong>public</strong> or <strong>unlisted</strong></li>
          <li>Share the generated curl command with anyone</li>
        </Ul>

        <SubHeading>Your First Script</SubHeading>
        <P>
          Click <Link href="/scripts/new" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 500 }}>New Script</Link> from
          the sidebar. Give it a name, a URL-friendly slug, and paste your bash code. Hit save, and
          you'll get a one-liner to run it from any terminal.
        </P>

        {/* ─── Scripts ─── */}
        <SectionHeading id="scripts">Scripts</SectionHeading>
        <P>
          Scripts are the core of HostMyBash. Each script has a name, slug, content, optional description, and a visibility setting.
        </P>

        <SubHeading>Creating a Script</SubHeading>
        <P>
          Go to <Link href="/scripts/new" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 500 }}>New Script</Link> and fill in the following:
        </P>
        <Ul>
          <li><strong>Name</strong> — Human-readable title (max 255 characters)</li>
          <li><strong>Slug</strong> — URL-friendly identifier, lowercase alphanumeric with hyphens (e.g. <InlineCode>deploy-app</InlineCode>)</li>
          <li><strong>Description</strong> — Optional, up to 2,000 characters</li>
          <li><strong>Content</strong> — Your bash script (up to 1 MB)</li>
          <li><strong>Visibility</strong> — Public, unlisted, or private</li>
        </Ul>

        <Callout type="info">
          Slugs must be unique per user. If you already have a script with slug <InlineCode>setup</InlineCode>, you
          cannot create another one with the same slug.
        </Callout>

        <SubHeading>Editing a Script</SubHeading>
        <P>
          Open any script from your dashboard, click the <strong>Edit</strong> button, make your changes, and save.
          The curl command stays the same — anyone using it will automatically get your latest version.
        </P>

        <SubHeading>Deleting a Script</SubHeading>
        <P>
          Click the <strong>Delete</strong> button on the script detail page. This action is permanent
          and cannot be undone. The curl URL will return a "not found" error after deletion.
        </P>

        {/* ─── Running Scripts ─── */}
        <SectionHeading id="running-scripts">Running Scripts</SectionHeading>
        <P>
          Every public or unlisted script gets a unique execution URL. Run it from any terminal using <InlineCode>curl</InlineCode> and <InlineCode>bash</InlineCode>:
        </P>
        <CodeBlock>{`bash <(curl -s https://username.hostmybash.com/script-slug)`}</CodeBlock>

        <P>
          Replace <InlineCode>username</InlineCode> with the script owner's username and <InlineCode>script-slug</InlineCode> with
          the script's slug. The URL serves the raw script content as plain text.
        </P>

        <SubHeading>How It Works</SubHeading>
        <Ul>
          <li><InlineCode>curl -s</InlineCode> fetches the script content silently</li>
          <li><InlineCode>bash &lt;(...)</InlineCode> executes the fetched content in a bash subshell</li>
          <li>Each execution increments the script's run count automatically</li>
          <li>The response is cached (60s browser, 300s CDN) for performance</li>
        </Ul>

        <Callout type="warning">
          <strong>Security note:</strong> Always review scripts before running them from the internet.
          You can view the script content on HostMyBash before executing it.
        </Callout>

        <SubHeading>Passing Arguments</SubHeading>
        <P>You can pass arguments to your script like this:</P>
        <CodeBlock>{`bash <(curl -s https://username.hostmybash.com/script-slug) arg1 arg2`}</CodeBlock>

        <P>Inside your script, access them with <InlineCode>$1</InlineCode>, <InlineCode>$2</InlineCode>, etc.</P>

        {/* ─── Visibility ─── */}
        <SectionHeading id="visibility">Visibility & Access</SectionHeading>
        <P>Each script has one of three visibility levels:</P>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div className="dashboard-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
              <strong style={{ color: "var(--text-heading)", fontSize: 14 }}>Public</strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Visible in Explore, searchable, runnable via curl. Shown on your public profile.
            </p>
          </div>
          <div className="dashboard-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warning)" }} />
              <strong style={{ color: "var(--text-heading)", fontSize: 14 }}>Unlisted</strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Not shown in Explore or search. Runnable via curl if someone has the URL.
            </p>
          </div>
          <div className="dashboard-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} />
              <strong style={{ color: "var(--text-heading)", fontSize: 14 }}>Private</strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Only visible to you. Cannot be run via curl. Not forkable or starrable by others.
            </p>
          </div>
        </div>

        {/* ─── Starring ─── */}
        <SectionHeading id="starring">Starring Scripts</SectionHeading>
        <P>
          Star scripts you find useful to bookmark them. Starred scripts appear in your{" "}
          <Link href="/starred" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 500 }}>Starred</Link> page
          for quick access.
        </P>
        <Ul>
          <li>Click the star icon on any public or unlisted script</li>
          <li>Star counts are shown on script cards and in Explore</li>
          <li>You cannot star your own scripts</li>
          <li>Starring/unstarring is tracked in your activity feed</li>
        </Ul>

        {/* ─── Forking ─── */}
        <SectionHeading id="forking">Forking Scripts</SectionHeading>
        <P>
          Forking creates a copy of someone else's script in your account, so you can modify it independently.
        </P>
        <Ul>
          <li>Click <strong>Fork</strong> on any public or unlisted script</li>
          <li>The forked script starts as <strong>private</strong> — you can change its visibility later</li>
          <li>The original script's slug is preserved if available, otherwise <InlineCode>-1</InlineCode>, <InlineCode>-2</InlineCode>, etc. are appended</li>
          <li>Fork count is incremented on the original script</li>
          <li>You cannot fork your own scripts</li>
        </Ul>

        <Callout type="tip">
          Forking is a great way to learn from others. Fork a script, study the code, modify it, then
          publish your version.
        </Callout>

        {/* ─── Explore ─── */}
        <SectionHeading id="explore">Explore & Discovery</SectionHeading>
        <P>
          The <Link href="/explore" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 500 }}>Explore</Link> page
          lets you browse all public scripts from the community.
        </P>
        <Ul>
          <li><strong>Search</strong> — Filter by name or description with the search bar</li>
          <li><strong>Sort</strong> — Order by Trending, Recent, Most Starred, or Most Runs</li>
          <li><strong>Script cards</strong> — Show author, description, star/fork/run counts</li>
          <li>Click any script to view its content, star it, or fork it</li>
        </Ul>

        {/* ─── Profile ─── */}
        <SectionHeading id="profile">Public Profile</SectionHeading>
        <P>
          Every user has a public profile page at <InlineCode>/u/username</InlineCode>. It shows:
        </P>
        <Ul>
          <li>Display name, username, bio, and avatar (via Gravatar)</li>
          <li>Contribution graph — a GitHub-style heatmap of your activity over the past year</li>
          <li>Public scripts with star and run counts</li>
          <li>Recent activity feed</li>
        </Ul>
        <P>
          Your avatar is pulled from <strong>Gravatar</strong> based on your email address. Update it
          at <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>gravatar.com</code>.
        </P>

        {/* ─── Activity ─── */}
        <SectionHeading id="activity">Activity Tracking</SectionHeading>
        <P>
          HostMyBash automatically tracks your actions. View your full history on
          the <Link href="/activity" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 500 }}>Activity</Link> page.
        </P>
        <P>Tracked events:</P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))", gap: 8, marginBottom: 16 }}>
          {[
            { verb: "Created", color: "var(--success)", desc: "New script created" },
            { verb: "Updated", color: "var(--accent)", desc: "Script content or settings changed" },
            { verb: "Deleted", color: "var(--danger)", desc: "Script removed" },
            { verb: "Starred", color: "var(--warning)", desc: "Bookmarked a script" },
            { verb: "Unstarred", color: "var(--text-faint)", desc: "Removed bookmark" },
            { verb: "Forked", color: "var(--accent-text)", desc: "Copied someone's script" },
          ].map((e) => (
            <div
              key={e.verb}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 8,
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                fontSize: 13,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-heading)", fontSize: 13 }}>{e.verb}</p>
                <p style={{ margin: 0, color: "var(--text-faint)", fontSize: 11 }}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <P>
          The Activity page lets you filter events by type and groups them by date. A preview of your
          latest activity also appears on the Dashboard.
        </P>

        {/* ─── Settings ─── */}
        <SectionHeading id="settings">Account Settings</SectionHeading>
        <P>
          Manage your account from the <Link href="/settings" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 500 }}>Settings</Link> page:
        </P>
        <Ul>
          <li><strong>Display Name</strong> — Shown on your profile and script cards</li>
          <li><strong>Bio</strong> — A short description visible on your public profile</li>
          <li><strong>Avatar</strong> — Set via Gravatar using your email address</li>
          <li><strong>Password</strong> — Change your account password (min 8 characters)</li>
        </Ul>

        {/* ─── API Reference ─── */}
        <SectionHeading id="api">API Reference</SectionHeading>
        <P>
          All dashboard features are powered by a REST API. Below are the available endpoints.
          All authenticated endpoints require a valid session cookie.
        </P>

        <SubHeading>Authentication</SubHeading>
        <div style={{ marginBottom: 20 }}>
          <ApiRow method="POST" path="/api/auth/register" desc="Create a new account" />
          <ApiRow method="POST" path="/api/auth/login" desc="Sign in" />
          <ApiRow method="POST" path="/api/auth/logout" desc="Sign out" />
          <ApiRow method="GET" path="/api/auth/me" desc="Get current user" />
          <ApiRow method="PUT" path="/api/auth/profile" desc="Update display name, bio" />
          <ApiRow method="PUT" path="/api/auth/password" desc="Change password" />
        </div>

        <SubHeading>Scripts</SubHeading>
        <div style={{ marginBottom: 20 }}>
          <ApiRow method="GET" path="/api/scripts" desc="List your scripts" />
          <ApiRow method="POST" path="/api/scripts" desc="Create a script" />
          <ApiRow method="GET" path="/api/scripts/:id" desc="Get a script by ID" />
          <ApiRow method="PUT" path="/api/scripts/:id" desc="Update a script" />
          <ApiRow method="DELETE" path="/api/scripts/:id" desc="Delete a script" />
          <ApiRow method="GET" path="/api/scripts/starred" desc="List your starred scripts" />
          <ApiRow method="PUT" path="/api/scripts/:id/star" desc="Star a script" />
          <ApiRow method="DELETE" path="/api/scripts/:id/star" desc="Unstar a script" />
          <ApiRow method="GET" path="/api/scripts/:id/star" desc="Check if starred" />
          <ApiRow method="POST" path="/api/scripts/:id/fork" desc="Fork a script" />
        </div>

        <SubHeading>Explore</SubHeading>
        <div style={{ marginBottom: 20 }}>
          <ApiRow method="GET" path="/api/explore" desc="Browse public scripts" />
        </div>
        <P>
          Query parameters: <InlineCode>sort</InlineCode> (trending, recent, stars, runs),{" "}
          <InlineCode>q</InlineCode> (search), <InlineCode>limit</InlineCode>, <InlineCode>offset</InlineCode>.
        </P>

        <SubHeading>Activity</SubHeading>
        <div style={{ marginBottom: 20 }}>
          <ApiRow method="GET" path="/api/activity" desc="Your activity feed" />
          <ApiRow method="GET" path="/api/activity/contributions" desc="Contribution graph data" />
          <ApiRow method="GET" path="/api/users/:username/activity" desc="User's public activity" />
        </div>

        <SubHeading>Script Execution</SubHeading>
        <div style={{ marginBottom: 20 }}>
          <ApiRow method="GET" path="/s/:username/:slug" desc="Raw script content (for curl)" />
        </div>

        {/* ─── Limits ─── */}
        <SectionHeading id="limits">Limits & Constraints</SectionHeading>
        <div style={{ marginBottom: 16 }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            {[
              ["Username", "3 – 32 characters, lowercase alphanumeric + hyphens"],
              ["Display Name", "2 – 64 characters"],
              ["Password", "8 – 128 characters"],
              ["Script Name", "1 – 255 characters"],
              ["Script Slug", "1 – 128 characters, lowercase alphanumeric + hyphens"],
              ["Script Description", "Up to 2,000 characters"],
              ["Script Content", "Up to 1 MB"],
              ["Activity Feed", "Max 50 events per request"],
              ["Explore Results", "Max 30 per page"],
            ].map(([label, value], i) => (
              <div
                key={label}
                style={{
                  display: "contents",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-heading)",
                    background: i % 2 === 0 ? "var(--bg-surface)" : "transparent",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    padding: "10px 16px",
                    fontSize: 13,
                    color: "var(--text-muted)",
                    background: i % 2 === 0 ? "var(--bg-surface)" : "transparent",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Callout type="info">
          Some usernames are reserved and cannot be used:{" "}
          <InlineCode>www</InlineCode>, <InlineCode>api</InlineCode>, <InlineCode>admin</InlineCode>,{" "}
          <InlineCode>app</InlineCode>, <InlineCode>panel</InlineCode>, <InlineCode>mail</InlineCode>,{" "}
          and others that conflict with platform subdomains.
        </Callout>

        {/* ─── Tips ─── */}
        <SectionHeading id="keyboard">Tips & Shortcuts</SectionHeading>
        <Ul>
          <li>Use <InlineCode>/</InlineCode> to quickly focus the sidebar search</li>
          <li>Toggle between dark and light mode from the sidebar toggle</li>
          <li>Your theme preference persists across sessions. On first visit, it matches your system setting.</li>
          <li>Click your avatar in the top bar to access Settings or Sign Out</li>
          <li>Script curl URLs always serve the latest version — no need to re-share after editing</li>
          <li>Use descriptive slugs like <InlineCode>setup-nginx</InlineCode> for readable URLs</li>
        </Ul>

        <Callout type="tip">
          Bookmark the Explore page to discover new scripts from the community regularly.
        </Callout>

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-faint)" }}>
            Need help? Reach out to the team or check back for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
