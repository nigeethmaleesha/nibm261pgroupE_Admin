import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { RepairJobSearchPage } from "@/src/views/repair-jobs/ui/RepairJobSearchPage";

export default function Page() {
  return (
    <InternalProtectedRoute allowedRoles={["owner_staff"]}>
      <RepairJobSearchPage />
    </InternalProtectedRoute>
  );
}
