"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 8px",
        borderRadius: "20px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        width: "60px",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={theme === "light" ? "var(--accent)" : "none"} stroke={theme === "light" ? "var(--accent)" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg width="14" height="14" viewBox="0 0 24 24" fill={theme === "dark" ? "var(--accent)" : "none"} stroke={theme === "dark" ? "var(--accent)" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
