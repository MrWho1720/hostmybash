"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FieldErrors = Record<string, string>;

type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "reserved"
  | "too_short";

export default function RegisterPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameStatus(value.length > 0 ? "too_short" : "idle");
      return;
    }
    setUsernameStatus("checking");
    try {
      const res = await fetch(
        `/api/auth/check-username?username=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      if (data.available) {
        setUsernameStatus("available");
      } else if (data.reason === "reserved") {
        setUsernameStatus("reserved");
      } else if (data.reason === "invalid_format") {
        setUsernameStatus("invalid");
      } else {
        setUsernameStatus("taken");
      }
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkUsername(username);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, checkUsername]);

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError("");

    const clientErrors: FieldErrors = {};
    if (password !== confirmPassword) {
      clientErrors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, displayName }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) {
          setFieldErrors(data.fields);
        } else {
          setGlobalError(data.error || "Registration failed");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/scripts");
        router.refresh();
      }, 1500);
    } catch {
      setGlobalError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  function fieldBorder(field: string) {
    return fieldErrors[field]
      ? "border-danger focus:ring-danger"
      : "border-edge focus:ring-accent";
  }

  function renderUsernameStatus() {
    if (usernameStatus === "idle") return null;
    if (usernameStatus === "checking") {
      return (
        <p className="text-xs text-muted mt-1 flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-muted border-t-transparent rounded-full animate-spin" />
          Checking availability...
        </p>
      );
    }
    if (usernameStatus === "available") {
      return <p className="text-xs text-success mt-1">@{username} is available</p>;
    }
    if (usernameStatus === "taken") {
      return <p className="text-xs text-danger mt-1">@{username} is already taken</p>;
    }
    if (usernameStatus === "reserved") {
      return <p className="text-xs text-warning mt-1">This username is reserved</p>;
    }
    if (usernameStatus === "too_short") {
      return <p className="text-xs text-faint mt-1">Username must be at least 3 characters</p>;
    }
    if (usernameStatus === "invalid") {
      return <p className="text-xs text-danger mt-1">Only lowercase letters, numbers and hyphens (not at start/end)</p>;
    }
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface rounded-lg p-10 border border-edge flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-heading">Account created!</h2>
          <p className="text-muted">Redirecting you to your dashboard...</p>
          <div className="w-48 h-1 bg-elevated rounded-full overflow-hidden mt-2">
            <div className="h-full bg-success rounded-full animate-progress" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-lg p-8 border border-edge">
        <h1 className="text-2xl font-semibold text-heading mb-1 tracking-tight">Create Account</h1>
        <p className="text-muted mb-6 text-sm">
          Host your bash scripts on HostMyBash
        </p>

        {globalError && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm text-body mb-1">Display Name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); clearFieldError("displayName"); }}
              className={`w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading focus:outline-none focus:ring-2 transition-colors ${fieldBorder("displayName")}`}
              placeholder="Jane Doe"
            />
            {fieldErrors.displayName && (
              <p className="text-xs text-danger mt-1">{fieldErrors.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-body mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              minLength={3}
              maxLength={32}
              value={username}
              onChange={(e) => {
                const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                setUsername(v);
                clearFieldError("username");
              }}
              className={`w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading font-mono focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.username ? "border-danger focus:ring-danger"
                : usernameStatus === "available" ? "border-success focus:ring-success"
                : usernameStatus === "taken" || usernameStatus === "reserved" ? "border-danger focus:ring-danger"
                : "border-edge focus:ring-accent"
              }`}
              placeholder="yourname"
            />
            {fieldErrors.username ? (
              <p className="text-xs text-danger mt-1">{fieldErrors.username}</p>
            ) : (
              renderUsernameStatus()
            )}
            {username && usernameStatus === "available" && (
              <p className="text-xs text-faint mt-1">
                Your scripts: https://{username}.{typeof window !== "undefined" ? window.location.hostname : "endever.in"}/script-name
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-body mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
              className={`w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading focus:outline-none focus:ring-2 transition-colors ${fieldBorder("email")}`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-body mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
                if (confirmPassword && e.target.value === confirmPassword) {
                  clearFieldError("confirmPassword");
                }
              }}
              className={`w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading focus:outline-none focus:ring-2 transition-colors ${fieldBorder("password")}`}
              placeholder="At least 8 characters"
            />
            {fieldErrors.password ? (
              <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>
            ) : (
              <p className="text-xs text-faint mt-1">Minimum 8 characters</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-body mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (password === e.target.value) {
                  clearFieldError("confirmPassword");
                }
              }}
              onBlur={() => {
                if (confirmPassword && password !== confirmPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Passwords do not match",
                  }));
                }
              }}
              className={`w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.confirmPassword ? "border-danger focus:ring-danger"
                : confirmPassword && password === confirmPassword ? "border-success focus:ring-success"
                : "border-edge focus:ring-accent"
              }`}
              placeholder="Re-enter your password"
            />
            {fieldErrors.confirmPassword ? (
              <p className="text-xs text-danger mt-1">{fieldErrors.confirmPassword}</p>
            ) : confirmPassword && password === confirmPassword ? (
              <p className="text-xs text-success mt-1">Passwords match</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
