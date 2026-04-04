"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type ErrorCode = "NO_ACCOUNT" | "WRONG_PASSWORD" | "DEACTIVATED" | "NETWORK" | "UNKNOWN";

const ERROR_MESSAGES: Record<ErrorCode, { title: string; hint: string }> = {
  NO_ACCOUNT: {
    title: "No account found",
    hint: "There's no account registered with that email. Want to create one?",
  },
  WRONG_PASSWORD: {
    title: "Incorrect password",
    hint: "Double-check your password and try again.",
  },
  DEACTIVATED: {
    title: "Account deactivated",
    hint: "This account has been disabled. Contact support if you think this is a mistake.",
  },
  NETWORK: {
    title: "Connection error",
    hint: "Could not reach the server. Check your internet connection and try again.",
  },
  UNKNOWN: {
    title: "Something went wrong",
    hint: "An unexpected error occurred. Please try again.",
  },
};

function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [highlightField, setHighlightField] = useState<"email" | "password" | null>(null);
  const [loading, setLoading] = useState(false);

  const rawFrom = searchParams.get("from") || "/scripts";
  const redirectTo = rawFrom.startsWith("/") && !rawFrom.startsWith("//") ? rawFrom : "/scripts";

  useEffect(() => {
    setErrorCode(null);
    setHighlightField(null);
  }, [email, password]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorCode(null);
    setHighlightField(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const code: ErrorCode = data.code ?? "UNKNOWN";
        setErrorCode(code);

        if (code === "NO_ACCOUNT") setHighlightField("email");
        if (code === "WRONG_PASSWORD") setHighlightField("password");
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setErrorCode("NETWORK");
    } finally {
      setLoading(false);
    }
  }

  const errorInfo = errorCode ? ERROR_MESSAGES[errorCode] : null;

  function fieldBorder(field: "email" | "password") {
    if (highlightField === field) {
      return "border-danger focus:ring-danger";
    }
    return "border-edge focus:ring-accent";
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-lg p-8 border border-edge">
        <h1 className="text-2xl font-semibold text-heading mb-1 tracking-tight">Sign In</h1>
        <p className="text-muted mb-6 text-sm">Welcome back to HostMyBash</p>

        {errorInfo && (
          <div className="mb-4 p-4 bg-danger/10 border border-danger/30 rounded-lg">
            <p className="text-danger text-sm font-medium">{errorInfo.title}</p>
            <p className="text-danger/70 text-xs mt-0.5">{errorInfo.hint}</p>
            {errorCode === "NO_ACCOUNT" && (
              <Link
                href="/register"
                className="inline-block mt-2 text-xs text-accent hover:text-accent-hover underline underline-offset-2"
              >
                Create an account
              </Link>
            )}
            {errorCode === "DEACTIVATED" && (
              <a
                href="mailto:support@endever.in"
                className="inline-block mt-2 text-xs text-accent hover:text-accent-hover underline underline-offset-2"
              >
                Contact support
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-body mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading focus:outline-none focus:ring-2 transition-colors ${fieldBorder("email")}`}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm text-body">
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading focus:outline-none focus:ring-2 transition-colors ${fieldBorder("password")}`}
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:text-accent-hover">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
