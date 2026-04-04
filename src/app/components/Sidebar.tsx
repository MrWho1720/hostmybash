"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  displayName: string;
  username: string;
  avatarUrl: string;
}

const navItems = [
  {
    href: "/scripts",
    label: "My Scripts",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/scripts/new",
    label: "New Script",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function Avatar({
  src,
  displayName,
}: {
  src: string;
  displayName: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-sm font-bold text-muted shrink-0 ring-1 ring-edge">
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
      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-edge"
      onError={() => setErrored(true)}
      unoptimized
    />
  );
}

export default function Sidebar({ displayName, username, avatarUrl }: SidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="w-64 bg-surface border-r border-edge flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-edge">
        <Link href="/scripts" className="text-xl font-bold text-heading tracking-tight">
          HostMyBash
        </Link>
        <p className="text-xs text-faint mt-1">Script Hosting Platform</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/scripts"
              ? pathname === "/scripts" || (pathname.startsWith("/scripts/") && item.href === "/scripts")
              : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-heading hover:bg-elevated"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile widget */}
      <div className="p-4 border-t border-edge space-y-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 group hover:bg-elevated rounded-lg px-2 py-2 transition-colors -mx-2"
          title="Go to Settings"
        >
          <Avatar src={avatarUrl} displayName={displayName} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-heading truncate leading-tight group-hover:text-accent transition-colors">
              {displayName}
            </p>
            <p className="text-xs text-faint truncate font-mono">
              @{username}
            </p>
          </div>
          <svg
            className="w-4 h-4 text-faint group-hover:text-muted shrink-0 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-faint hover:text-danger hover:bg-danger/5 rounded-lg transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
