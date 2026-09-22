"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Clock3, LockKeyhole, Mail, Phone, RefreshCw, UserRound, X } from "lucide-react";
import {
  createTechnician,
  resendTechnicianAccountOtp,
  verifyTechnicianAccount,
} from "@/src/shared/api/technicians.api";
import { ApiError } from "@/src/shared/api/http";
import { EMAIL_REGEX, isValidContactNumber, normalizeEmail } from "@/src/shared/lib/validation";
import type { InternalUser } from "@/src/shared/types/internal";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { OtpInput } from "@/src/shared/ui/OtpInput";
import { PasswordStrength } from "@/src/shared/ui/PasswordStrength";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

function formatSeconds(value: number) {
  const safe = Math.max(0, value);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AddTechnicianModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (technician: InternalUser) => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading && !isResending) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isLoading, isResending, onClose, open]);

  useEffect(() => {
    if (!open || step !== "verify") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open, step]);

  const expirySeconds = useMemo(
    () => Math.max(0, Math.ceil((expiresAt - now) / 1000)),
    [expiresAt, now],
  );
  const resendSeconds = useMemo(
    () => Math.max(0, Math.ceil((resendAt - now) / 1000)),
    [resendAt, now],
  );

  if (!open) return null;

  const reset = () => {
    setStep("details");
    setFullName("");
    setEmail("");
    setContactNumber("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setExpiresAt(0);
    setResendAt(0);
    setError(null);
  };

  const close = () => {
    if (isLoading || isResending) return;
    reset();
    onClose();
  };

  const applyOtpTiming = (response: {
    otpExpiresInSeconds?: number;
    resendAvailableInSeconds?: number;
  }) => {
    const time = Date.now();
    setNow(time);
    setExpiresAt(time + Number(response.otpExpiresInSeconds || 600) * 1000);
    setResendAt(time + Number(response.resendAvailableInSeconds || 60) * 1000);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = normalizeEmail(email);
    const cleanContact = contactNumber.trim();

    if (cleanName.length < 2) return setError("Enter the technician's full name.");
    if (!EMAIL_REGEX.test(cleanEmail)) return setError("Enter a valid email address.");
    if (!isValidContactNumber(cleanContact)) return setError("Enter a valid contact number.");
    if (password.length < 12) return setError("Password must contain at least 12 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    try {
      setIsLoading(true);
      const response = await createTechnician({
        fullName: cleanName,
        email: cleanEmail,
        contactNumber: cleanContact,
        password,
      });
      setEmail(response.technician.email);
      setOtp("");
      applyOtpTiming(response);
      setStep("verify");
      toast.info("Technician details saved. Enter the OTP sent to their email to finish setup.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to create the technician account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setError(null);
    if (!/^\d{6}$/.test(otp)) return setError("Enter the complete 6-digit OTP.");
    if (expirySeconds <= 0) return setError("This OTP has expired. Request a new code.");

    try {
      setIsLoading(true);
      const response = await verifyTechnicianAccount({ email: normalizeEmail(email), otp });
      toast.success("Technician account created and verified successfully.");
      onCreated(response.user);
      reset();
      onClose();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to verify the technician OTP.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendSeconds > 0) return;
    setError(null);
    try {
      setIsResending(true);
      const response = await resendTechnicianAccountOtp({ email: normalizeEmail(email) });
      setOtp("");
      applyOtpTiming(response);
      toast.success("A new technician verification OTP was sent.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to resend the technician OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close modal" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]" onClick={close} />
      <div className="rf-hide-scrollbar relative z-10 max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-[26px] border border-white bg-white shadow-[0_30px_100px_rgba(15,23,42,0.24)]">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-xl sm:px-7">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Owner / Staff only</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.025em] text-slate-950">
              {step === "details" ? "Add technician" : "Verify technician email"}
            </h2>
            <p className="mt-1 text-[13px] font-medium text-slate-500">
              {step === "details"
                ? "Create the technician account using their assigned details."
                : "Enter the OTP sent to the technician's email to complete account creation."}
            </p>
          </div>
          <button type="button" onClick={close} disabled={isLoading || isResending} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "details" ? (
          <form onSubmit={handleCreate} className="space-y-5 p-6 sm:p-7" noValidate>
            {error && <InlineAlert>{error}</InlineAlert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Full name"
                name="fullName"
                value={fullName}
                required
                autoFocus
                disabled={isLoading}
                placeholder="Technician full name"
                icon={<UserRound className="h-[18px] w-[18px]" />}
                onChange={(event) => { setFullName(event.target.value); if (error) setError(null); }}
              />
              <FormField
                label="Contact number"
                name="contactNumber"
                value={contactNumber}
                required
                disabled={isLoading}
                placeholder="077 123 4567"
                icon={<Phone className="h-[18px] w-[18px]" />}
                onChange={(event) => { setContactNumber(event.target.value); if (error) setError(null); }}
              />
            </div>

            <FormField
              label="Email address"
              name="email"
              type="email"
              value={email}
              required
              disabled={isLoading}
              placeholder="technician@example.com"
              icon={<Mail className="h-[18px] w-[18px]" />}
              onChange={(event) => { setEmail(event.target.value); if (error) setError(null); }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormField
                  label="Initial password"
                  name="password"
                  type="password"
                  value={password}
                  required
                  disabled={isLoading}
                  placeholder="Minimum 12 characters"
                  icon={<LockKeyhole className="h-[18px] w-[18px]" />}
                  passwordToggle
                  onChange={(event) => { setPassword(event.target.value); if (error) setError(null); }}
                />
                <PasswordStrength password={password} />
              </div>
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
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={close} disabled={isLoading} className="h-11 rounded-xl border border-slate-200 px-5 text-[13px] font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <div className="w-full sm:w-[190px]">
                <PrimaryButton type="submit" loading={isLoading} className="h-11">Continue</PrimaryButton>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5 p-6 sm:p-7" noValidate>
            {error && <InlineAlert>{error}</InlineAlert>}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-center text-[13px] font-semibold text-slate-600">
              Verification code sent to <span className="font-extrabold text-slate-900">{email}</span>
            </div>
            <OtpInput value={otp} onChange={(value) => { setOtp(value); if (error) setError(null); }} disabled={isLoading} />
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12px] font-bold text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-blue-500" />
                {expirySeconds > 0 ? formatSeconds(expirySeconds) : "Code expired"}
              </span>
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={resendSeconds > 0 || isResending || isLoading}
                className="inline-flex items-center gap-1.5 text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "Sending..." : resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
              </button>
            </div>
            <PrimaryButton type="submit" loading={isLoading} disabled={otp.length !== 6 || expirySeconds <= 0}>
              Verify & create technician
            </PrimaryButton>
          </form>
        )}
      </div>
    </div>
  );
}
