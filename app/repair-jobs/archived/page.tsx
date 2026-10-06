import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { ArchivedJobsPage } from "@/src/views/repair-jobs/ui/ArchivedJobsPage";

export default function Page() {
  return (
    <InternalProtectedRoute allowedRoles={["owner_staff"]}>
      <ArchivedJobsPage />
    </InternalProtectedRoute>
  );
}
