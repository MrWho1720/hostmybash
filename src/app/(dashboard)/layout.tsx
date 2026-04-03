import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
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

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
