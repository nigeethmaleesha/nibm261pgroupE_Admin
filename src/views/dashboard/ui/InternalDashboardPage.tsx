"use client";

import { useInternalAuth } from "@/src/shared/auth/InternalAuthProvider";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { ShopWorkDashboard } from "@/src/widgets/dashboard/ui/ShopWorkDashboard";
import { TechnicianDashboardView } from "@/src/widgets/technician/ui/TechnicianDashboardView";

export function InternalDashboardPage() {
  const { user } = useInternalAuth();
  if (!user) return null;

  const isOwner = user.role === "owner_staff";

  if (!isOwner) {
    return (
      <InternalDashboardShell>
        <TechnicianDashboardView />
      </InternalDashboardShell>
    );
  }

  return (
    <InternalDashboardShell>
      <ShopWorkDashboard fullName={user.fullName} />
    </InternalDashboardShell>
  );
}
