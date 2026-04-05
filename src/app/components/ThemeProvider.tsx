"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // On mount: read saved preference, fall back to system preference
  useEffect(() => {
    const saved = localStorage.getItem("hmb-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      apply(saved);
      setTheme(saved);
    } else {
      // No saved preference — use system preference
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved: Theme = systemDark ? "dark" : "light";
      apply(resolved);
      setTheme(resolved);
    }
  }, []);

  function apply(t: Theme) {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
  }

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      apply(next);
      localStorage.setItem("hmb-theme", next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
