"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/scripts", label: "My Scripts", icon: "📄" },
  { href: "/scripts/new", label: "New Script", icon: "➕" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/scripts" className="text-xl font-bold text-white">
          HostMyBash
        </Link>
        <p className="text-xs text-gray-500 mt-1">Script Hosting Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
