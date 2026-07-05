import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect layout: Redirect if not logged in
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar user={session.user} />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/30 p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
