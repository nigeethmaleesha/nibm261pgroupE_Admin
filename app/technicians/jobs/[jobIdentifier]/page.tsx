import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { TechnicianJobDetailPage } from "@/src/views/technicians/ui/TechnicianJobDetailPage";

export default function Page() {
  return (
    <InternalProtectedRoute allowedRoles={["technician"]}>
      <TechnicianJobDetailPage />
    </InternalProtectedRoute>
  );
}
