"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { initiateInternalForgotPassword } from "@/src/shared/api/internalAuth.api";
import { ApiError } from "@/src/shared/api/http";
import { savePendingInternalOtp } from "@/src/shared/auth/pendingInternalAuth";
import { EMAIL_REGEX, normalizeEmail } from "@/src/shared/lib/validation";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

export function InternalForgotPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setError(null);
    const cleanEmail = normalizeEmail(email);
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiateInternalForgotPassword({ email: cleanEmail });
      savePendingInternalOtp({
        flow: "FORGOT_PASSWORD",
        email: response.email || cleanEmail,
        otpExpiresInSeconds: response.otpExpiresInSeconds,
        resendAvailableInSeconds: response.resendAvailableInSeconds,
      });
      toast.info("If the account is eligible, a recovery code has been sent.");
      router.push("/staff/forgot-password/verify-otp");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to start password recovery.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}
      <FormField
        label="Account email"
        name="email"
        type="email"
        value={email}
        autoComplete="email"
        autoFocus
        required
        disabled={isLoading}
        placeholder="you@example.com"
        icon={<Mail className="h-[18px] w-[18px]" />}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError(null);
        }}
      />
      <PrimaryButton type="submit" loading={isLoading}>Send reset code</PrimaryButton>
    </form>
  );
}
