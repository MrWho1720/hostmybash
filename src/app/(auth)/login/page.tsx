"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

// Inner component that uses useSearchParams (needs Suspense wrapper)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [highlightField, setHighlightField] = useState<"email" | "password" | null>(null);
  const [loading, setLoading] = useState(false);

  // Read `?from=` for post-login redirect
  const redirectTo = searchParams.get("from") || "/scripts";

  // Clear field highlight when user starts editing
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

        // Highlight the relevant field
        if (code === "NO_ACCOUNT") setHighlightField("email");
        if (code === "WRONG_PASSWORD") setHighlightField("password");
        return;
      }

      // Success — redirect to intended page
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorCode("NETWORK");
    } finally {
      setLoading(false);
    }
  }

  const errorInfo = errorCode ? ERROR_MESSAGES[errorCode] : null;

  function fieldBorder(field: "email" | "password") {
    if (highlightField === field) {
      return "border-red-500 focus:ring-red-500";
    }
    return "border-gray-700 focus:ring-blue-500";
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
        <p className="text-gray-400 mb-6 text-sm">Welcome back to HostMyBash</p>

        {errorInfo && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700/60 rounded-lg">
            <p className="text-red-300 text-sm font-medium">{errorInfo.title}</p>
            <p className="text-red-400/80 text-xs mt-0.5">{errorInfo.hint}</p>
            {errorCode === "NO_ACCOUNT" && (
              <Link
                href="/register"
                className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                Create an account →
              </Link>
            )}
            {errorCode === "DEACTIVATED" && (
              <a
                href="mailto:support@endever.in"
                className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                Contact support →
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-gray-300 mb-1"
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
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${fieldBorder("email")}`}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm text-gray-300">
                Password
              </label>
              {/* Forgot password placeholder — wire up when ready */}
              {/* <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link> */}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${fieldBorder("password")}`}
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

// Export wraps inner component in Suspense (required for useSearchParams in Next.js App Router)
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
