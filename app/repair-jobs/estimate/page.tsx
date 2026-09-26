import { InternalProtectedRoute } from "@/src/shared/auth/InternalProtectedRoute";
import { EstimateLookupPage } from "@/src/views/estimates/ui/EstimateLookupPage";

export default function Page() {
  return (
    <InternalProtectedRoute allowedRoles={["owner_staff"]}>
      <EstimateLookupPage />
    </InternalProtectedRoute>
  );
}
