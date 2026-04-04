import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getGravatarUrl } from "@/lib/auth/gravatar";
import Sidebar from "@/app/components/Sidebar";

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
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        displayName={user.displayName}
        username={user.username}
        avatarUrl={avatarUrl}
      />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

