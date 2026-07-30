import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { AdminDashboardScreen } from "@/features/dashboard/screens/admin-dashboard-screen";
import { CitizenDashboardScreen } from "@/features/dashboard/screens/citizen-dashboard-screen";
import { DriverDashboardScreen } from "@/features/dashboard/screens/driver-dashboard-screen";
import { AdminLayout } from "@/features/dashboard/layouts/admin-layout";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role?.toUpperCase();

  if (role === "ADMIN") {
    const { getAnnouncements } = await import("@/features/announcements/services/announcement.service");
    const announcements = await getAnnouncements();
    return (
      <AdminLayout>
        <AdminDashboardScreen initialAnnouncements={announcements} />
      </AdminLayout>
    );
  }
  if (role === "DRIVER") {
    redirect("/driver");
  }
  
  return <CitizenDashboardScreen />;
}
