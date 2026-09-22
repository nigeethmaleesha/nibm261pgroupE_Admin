"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { changeInternalForgottenPassword } from "@/src/shared/api/internalAuth.api";
import { ApiError } from "@/src/shared/api/http";
import { clearInternalPasswordReset, readInternalPasswordReset } from "@/src/shared/auth/pendingInternalAuth";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { PasswordStrength } from "@/src/shared/ui/PasswordStrength";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

export function InternalResetPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const state = readInternalPasswordReset();
    if (!state) {
      router.replace("/staff/forgot-password");
      return;
    }
    setResetToken(state.resetToken);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setError(null);
    if (password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await changeInternalForgottenPassword({
        resetToken,
        newPassword: password,
        confirmPassword,
      });
      clearInternalPasswordReset();
      toast.success(response.message || "Password changed successfully.");
      router.replace("/staff/login");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to change the password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}
      <FormField
        label="New password"
        name="password"
        type="password"
        value={password}
        required
        autoFocus
        disabled={isLoading}
        placeholder="Minimum 12 characters"
        icon={<LockKeyhole className="h-[18px] w-[18px]" />}
        passwordToggle
        onChange={(event) => { setPassword(event.target.value); if (error) setError(null); }}
      />
      <PasswordStrength password={password} />
      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        required
        disabled={isLoading}
        placeholder="Re-enter password"
        icon={<LockKeyhole className="h-[18px] w-[18px]" />}
        passwordToggle
        onChange={(event) => { setConfirmPassword(event.target.value); if (error) setError(null); }}
      />
      <PrimaryButton type="submit" loading={isLoading}>Update password</PrimaryButton>
    </form>
  );
}
