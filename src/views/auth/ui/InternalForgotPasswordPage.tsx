import { AuthShell } from "@/src/shared/ui/AuthShell";
import { InternalForgotPasswordForm } from "@/src/widgets/auth/ui/InternalForgotPasswordForm";

export function InternalForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      backHref="/staff/login"
      backLabel="Back to sign in"
      compact
    >
      <InternalForgotPasswordForm />
    </AuthShell>
  );
}
