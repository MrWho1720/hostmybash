import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import Sidebar from "@/app/components/Sidebar";
import ThemeProvider from "@/app/components/ThemeProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user) {
    redirect("/login");
  }

  const avatarUrl = user.avatarUrl ?? getGravatarUrl(user.email, 80);

  return (
    <ThemeProvider>
      <div className="flex min-h-screen" style={{ background: "var(--bg-page)" }}>
        <Sidebar
          displayName={user.displayName}
          username={user.username}
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 p-8 min-w-0 animate-fade-in">{children}</main>
      </div>
    </ThemeProvider>
  );
}
