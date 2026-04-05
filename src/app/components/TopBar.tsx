"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { navGroups } from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/scripts") {
      return (
        pathname === "/scripts" ||
        (pathname.startsWith("/scripts/") && !pathname.startsWith("/scripts/new"))
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 md:px-8 md:py-4 sticky top-0 z-10 bg-transparent">
        {/* Left side: Mobile Menu Toggle / Title placeholder */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="md:hidden flex items-center justify-center dashboard-card"
            style={{ width: 40, height: 40, border: "1px solid var(--border)", background: "var(--bg-surface)", cursor: "pointer" }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
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

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          {/* Drawer */}
          <div 
            className="w-4/5 max-w-sm h-full flex flex-col"
            style={{ background: "var(--bg-inset)", borderRight: "1px solid var(--border)" }}
          >
            <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>
                  HostMyBash
                </p>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div style={{ padding: "0 24px 24px" }}>
              <ThemeToggle />
            </div>

            <nav style={{ flex: 1, padding: "0 16px 24px", overflowY: "auto" }}>
              {navGroups.map((group, gi) => (
                <div key={gi} style={{ marginBottom: 32 }}>
                  <p style={{ margin: "0 0 12px 12px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "var(--text-faint)", textTransform: "uppercase" }}>
                    {group.label}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "10px", fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "var(--text-heading)" : "var(--text-muted)", background: active ? "var(--bg-surface)" : "transparent", textDecoration: "none"
                          }}
                        >
                          <span style={{ color: active ? "var(--text-heading)" : "var(--text-muted)" }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          {/* Detect click outside */}
          <div className="flex-1 cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
