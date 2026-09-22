import { AuthShell } from "@/src/shared/ui/AuthShell";
import { InternalOtpVerificationForm } from "@/src/widgets/auth/ui/InternalOtpVerificationForm";

export function InternalOtpPage({ flow }: { flow: "LOGIN" | "FORGOT_PASSWORD" }) {
  const isLogin = flow === "LOGIN";
  return (
    <AuthShell
      eyebrow="OTP verification"
      title={isLogin ? "Verify your sign in" : "Verify recovery code"}
      backHref={isLogin ? "/staff/login" : "/staff/forgot-password"}
      backLabel="Go back"
      compact
    >
      <InternalOtpVerificationForm flow={flow} />
    </AuthShell>
  );
}
