import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import Sidebar from "@/app/components/Sidebar";
import TopBar from "@/app/components/TopBar";
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
      <div className="flex min-h-screen" style={{ background: "var(--bg-inset)" }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--bg-page)", borderTopLeftRadius: "24px", overflow: "hidden", boxShadow: "inset 0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <TopBar
            displayName={user.displayName}
            username={user.username}
            avatarUrl={avatarUrl}
          />
          <main className="flex-1 p-8 min-w-0 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
