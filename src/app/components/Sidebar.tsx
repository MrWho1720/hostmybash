"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const navGroups = [
  {
    label: "Navigation",
    items: [
      {
        href: "/scripts",
        label: "Dashboard",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        ),
      },
      {
        href: "/scripts/new",
        label: "New Script",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        ),
      },
      {
        href: "/starred",
        label: "Starred",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
      {
        href: "/activity",
        label: "Activity",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Discover",
    items: [
      {
        href: "/explore",
        label: "Explore",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ),
      },
      {
        href: "/docs",
        label: "Documentation",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
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

  return (
    <aside
      style={{
        width: "260px",
        flexShrink: 0,
        background: "var(--bg-inset)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "background 0.2s ease",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: "24px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/scripts"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          {/* Logo Icon */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-heading)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              HostMyBash
            </p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Search placeholder */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: "10px", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-muted)"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span style={{ fontSize: "13px" }}>Search</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: "4px" }}>/</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "24px 16px", overflowY: "auto" }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 32 }}>
            <p
              style={{
                margin: "0 0 12px 12px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "var(--text-faint)",
                textTransform: "uppercase",
              }}
            >
              {group.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: "10px",
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? "var(--text-heading)" : "var(--text-muted)",
                      background: active ? "var(--bg-surface)" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      boxShadow: active ? "0 2px 4px rgba(0, 0, 0, 0.02), 0 0 0 1px var(--border)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-heading)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                      }
                    }}
                  >
                    <span style={{ color: active ? "var(--text-heading)" : "var(--text-muted)", transition: "color 0.2s ease" }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Upgrade Plan Widget */}
      <div style={{ padding: "24px 16px" }}>
        <div style={{
          background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
          borderRadius: "16px",
          padding: "20px 16px",
          color: "#fff",
          textAlign: "center"
        }}>
          <div style={{ display: "inline-flex", padding: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "10px", marginBottom: "12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700 }}>View + Event Limit</h4>
          <p style={{ margin: "0 0 16px", fontSize: "11px", opacity: 0.9 }}>225,948/500,000 Monthly Limit</p>
          <div style={{ background: "rgba(255,255,255,0.3)", height: "4px", borderRadius: "2px", marginBottom: "16px", overflow: "hidden" }}>
            <div style={{ background: "#fff", width: "45%", height: "100%", borderRadius: "2px" }} />
          </div>
          <button style={{
            width: "100%", padding: "10px", borderRadius: "24px", background: "#fff", color: "#6366f1", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", marginBottom: "8px"
          }}>
            Learn more
          </button>
          <button style={{
            width: "100%", padding: "10px", borderRadius: "24px", background: "#111827", color: "#fff", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ flex: 1 }}>Upgrade plan</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

    </aside>
  );
}
