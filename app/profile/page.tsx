import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { InternalProfilePage } from "@/src/views/profile/ui/InternalProfilePage";

export default function Page() {
  return (
    <InternalProtectedRoute>
      <InternalProfilePage />
    </InternalProtectedRoute>
  );
}
