import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { InternalDashboardPage } from "@/src/views/dashboard/ui/InternalDashboardPage";

export default function Page() {
  return (
    <InternalProtectedRoute>
      <InternalDashboardPage />
    </InternalProtectedRoute>
  );
}
