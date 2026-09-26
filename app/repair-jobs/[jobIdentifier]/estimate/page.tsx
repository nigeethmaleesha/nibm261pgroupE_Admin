import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { RepairEstimatePage } from "@/src/views/estimates/ui/RepairEstimatePage";

export default function Page() {
  return (
    <InternalProtectedRoute allowedRoles={["owner_staff"]}>
      <RepairEstimatePage />
    </InternalProtectedRoute>
  );
}
