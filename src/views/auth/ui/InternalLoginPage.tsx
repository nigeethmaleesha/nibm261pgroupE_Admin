import { AuthShell } from "@/src/shared/ui/AuthShell";
import { InternalLoginForm } from "@/src/widgets/auth/ui/InternalLoginForm";

export function InternalLoginPage() {
  return (
    <AuthShell eyebrow="Secure staff access" title="Staff sign in" compact>
      <InternalLoginForm />
    </AuthShell>
  );
}
