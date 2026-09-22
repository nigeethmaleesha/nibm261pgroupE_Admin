import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { TechniciansPage } from "@/src/views/technicians/ui/TechniciansPage";

export default function Page() {
  return (
    <InternalProtectedRoute allowedRoles={["owner_staff"]}>
      <TechniciansPage />
    </InternalProtectedRoute>
  );
}
