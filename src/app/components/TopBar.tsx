"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

function Avatar({ src, displayName }: { src: string; displayName: string }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        style={{
          width: 36, height: 36,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 600,
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={displayName}
      width={36}
      height={36}
      style={{
        width: 36, height: 36,
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

interface TopBarProps {
  displayName: string;
  username: string;
  avatarUrl: string;
}

export default function TopBar({ displayName, username, avatarUrl }: TopBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        background: "transparent",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left side: Search or Title placeholder */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* We can put breadcrumbs or search here */}
      </div>

      {/* Right side: Action buttons and Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Profile Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "4px 12px 4px 4px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "40px",
              cursor: "pointer",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            }}
          >
            <Avatar src={avatarUrl} displayName={displayName} />
            <div style={{ textAlign: "left", display: "none" }} className="md:block">
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-heading)", lineHeight: 1.2 }}>
                {displayName}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                @{username}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showDropdown && (
            <div
              className="dashboard-card"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                padding: "8px",
                width: "200px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                zIndex: 20,
              }}
            >
              <Link
                href="/settings"
                onClick={() => setShowDropdown(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: 13,
                  color: "var(--text-heading)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-elevated)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "var(--danger)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--danger-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
