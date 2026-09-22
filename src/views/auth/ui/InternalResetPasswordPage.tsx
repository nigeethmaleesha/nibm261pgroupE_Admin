import { AuthShell } from "@/src/shared/ui/AuthShell";
import { InternalResetPasswordForm } from "@/src/widgets/auth/ui/InternalResetPasswordForm";

export function InternalResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="New password"
      title="Create a new password"
      backHref="/staff/login"
      backLabel="Back to sign in"
      compact
    >
      <InternalResetPasswordForm />
    </AuthShell>
  );
}
