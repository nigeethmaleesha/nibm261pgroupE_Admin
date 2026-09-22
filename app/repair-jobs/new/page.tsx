import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { RegisterRepairJobPage } from "@/src/views/repair-jobs/ui/RegisterRepairJobPage";

export default function Page() {
  return (
    <InternalProtectedRoute allowedRoles={["owner_staff"]}>
      <RegisterRepairJobPage />
    </InternalProtectedRoute>
  );
}
