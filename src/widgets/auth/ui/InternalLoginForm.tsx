"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { loginInternal } from "@/src/shared/api/internalAuth.api";
import { ApiError } from "@/src/shared/api/http";
import { savePendingInternalOtp } from "@/src/shared/auth/pendingInternalAuth";
import { EMAIL_REGEX, normalizeEmail } from "@/src/shared/lib/validation";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

export function InternalLoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!password) {
      setError("Enter your password.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await loginInternal({ email: cleanEmail, password });
      savePendingInternalOtp({
        flow: "LOGIN",
        email: response.email || cleanEmail,
        otpExpiresInSeconds: response.otpExpiresInSeconds,
        resendAvailableInSeconds: response.resendAvailableInSeconds,
      });
      toast.info("Password accepted. A 6-digit login code was sent to your email.");
      router.push("/staff/login/verify-otp");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to sign in right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}

      <FormField
        label="Email address"
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

      <div className="space-y-1.5">
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          autoComplete="current-password"
          required
          disabled={isLoading}
          placeholder="Enter your password"
          icon={<LockKeyhole className="h-[18px] w-[18px]" />}
          passwordToggle
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError(null);
          }}
        />
        <div className="flex justify-end">
          <Link
            href="/staff/forgot-password"
            className="text-[12px] font-extrabold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <PrimaryButton type="submit" loading={isLoading}>Sign in</PrimaryButton>
    </form>
  );
}
