"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Profile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string;
}

type FieldErrors = Record<string, string>;

function SuccessBadge({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-success text-sm">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-danger mt-1">{msg}</p>;
}

function inputClass(err?: string) {
  return `w-full px-4 py-2.5 bg-elevated border rounded-lg text-heading text-sm focus:outline-none focus:ring-2 transition-colors ${
    err ? "border-danger focus:ring-danger" : "border-edge focus:ring-accent"
  }`;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-edge rounded-lg p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-heading">{title}</h2>
        {description && (
          <p className="text-sm text-faint mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function AvatarPreview({
  src,
  displayName,
}: {
  src: string;
  displayName: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="w-20 h-20 rounded-full bg-elevated flex items-center justify-center text-2xl font-bold text-muted shrink-0">
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Avatar"
      width={80}
      height={80}
      className="w-20 h-20 rounded-full object-cover shrink-0 ring-1 ring-edge"
      onError={() => setErrored(true)}
      unoptimized
    />
  );
}

function ProfileSection({ profile, onUpdate }: { profile: Profile; onUpdate: (p: Partial<Profile>) => void }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatarUrl.includes("gravatar.com") ? "" : profile.avatarUrl
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const previewUrl = avatarUrl.trim() || profile.avatarUrl;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaved(false);

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio: bio || null, avatarUrl: avatarUrl || null }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setErrors(data.fields ?? { displayName: data.error ?? "Failed to save" });
      return;
    }

    setSaved(true);
    onUpdate({ displayName: data.displayName, bio: data.bio, avatarUrl: data.avatarUrl });
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Section title="Public Profile" description="This information may be visible to other users.">
      <form onSubmit={handleSave} className="space-y-5">
        <div className="flex items-center gap-5">
          <AvatarPreview src={previewUrl} displayName={displayName} />
          <div className="flex-1">
            <label className="block text-sm text-body mb-1">Avatar URL</label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => { setAvatarUrl(e.target.value); setErrors((p) => { const n = {...p}; delete n.avatarUrl; return n; }); }}
              placeholder="https://... (leave blank to use Gravatar)"
              className={inputClass(errors.avatarUrl)}
            />
            <FieldError msg={errors.avatarUrl} />
            <p className="text-xs text-faint mt-1">
              Leave blank to use your Gravatar ({profile.email})
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm text-body mb-1">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setErrors((p) => { const n = {...p}; delete n.displayName; return n; }); }}
            className={inputClass(errors.displayName)}
            placeholder="Your name"
          />
          <FieldError msg={errors.displayName} />
        </div>

        <div>
          <label className="block text-sm text-body mb-1">
            Bio
            <span className="ml-2 text-faint font-normal text-xs">{bio.length}/300</span>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => { setBio(e.target.value.slice(0, 300)); setErrors((p) => { const n = {...p}; delete n.bio; return n; }); }}
            rows={3}
            placeholder="Tell people a little about yourself..."
            className={`${inputClass(errors.bio)} resize-none`}
          />
          <FieldError msg={errors.bio} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-faint mb-1">Username</label>
            <div className="px-4 py-2.5 bg-elevated/50 border border-edge/50 rounded-lg text-muted text-sm font-mono">
              @{profile.username}
            </div>
            <p className="text-xs text-faint mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm text-faint mb-1">Email</label>
            <div className="px-4 py-2.5 bg-elevated/50 border border-edge/50 rounded-lg text-muted text-sm truncate">
              {profile.email}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {saved ? <SuccessBadge message="Profile saved" /> : <span />}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaved(false);

    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: "New passwords do not match" });
      setSaving(false);
      return;
    }

    const res = await fetch("/api/auth/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setErrors(data.fields ?? { currentPassword: data.error ?? "Failed to update" });
      return;
    }

    setSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    formRef.current?.reset();
    setTimeout(() => setSaved(false), 3000);
  }

  const strength = newPassword.length === 0
    ? null
    : newPassword.length < 8
    ? "weak"
    : newPassword.length < 12
    ? "fair"
    : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword)
    ? "strong"
    : "good";

  const strengthConfig = {
    weak:   { label: "Too short", color: "bg-danger",  text: "text-danger",  width: "w-1/4" },
    fair:   { label: "Fair",      color: "bg-warning",  text: "text-warning",  width: "w-2/4" },
    good:   { label: "Good",      color: "bg-accent",   text: "text-accent",   width: "w-3/4" },
    strong: { label: "Strong",    color: "bg-success",  text: "text-success",  width: "w-full" },
  };

  return (
    <Section title="Change Password" description="Use a strong password you don't use anywhere else.">
      <form ref={formRef} onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm text-body mb-1">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => { const n = {...p}; delete n.currentPassword; return n; }); }}
            className={inputClass(errors.currentPassword)}
            placeholder="Your current password"
          />
          <FieldError msg={errors.currentPassword} />
        </div>

        <div>
          <label className="block text-sm text-body mb-1">New Password</label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => { const n = {...p}; delete n.newPassword; return n; }); }}
            className={inputClass(errors.newPassword)}
            placeholder="At least 8 characters"
          />
          <FieldError msg={errors.newPassword} />
          {strength && (
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full bg-elevated rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-200 ${strengthConfig[strength].color} ${strengthConfig[strength].width}`} />
              </div>
              <p className={`text-xs ${strengthConfig[strength].text}`}>
                {strengthConfig[strength].label}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-body mb-1">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            value={confirmNewPassword}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              if (newPassword === e.target.value) setErrors((p) => { const n = {...p}; delete n.confirmNewPassword; return n; });
            }}
            className={`${inputClass(errors.confirmNewPassword)} ${
              !errors.confirmNewPassword && confirmNewPassword && newPassword === confirmNewPassword
                ? "border-success focus:ring-success"
                : ""
            }`}
            placeholder="Repeat new password"
          />
          {errors.confirmNewPassword ? (
            <FieldError msg={errors.confirmNewPassword} />
          ) : confirmNewPassword && newPassword === confirmNewPassword ? (
            <p className="text-xs text-success mt-1">Passwords match</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-1">
          {saved ? <SuccessBadge message="Password updated" /> : <span />}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </Section>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setLoadError(true);
        else setProfile(data);
      })
      .catch(() => setLoadError(true));
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64 text-faint text-sm">
        Failed to load profile. Please refresh.
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-heading tracking-tight">Settings</h1>
        <p className="text-faint text-sm mt-1">Manage your profile and account security</p>
      </div>

      <ProfileSection
        profile={profile}
        onUpdate={(updates) => setProfile((p) => p ? { ...p, ...updates } : p)}
      />

      <PasswordSection />
    </div>
  );
}
