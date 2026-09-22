export type PendingInternalFlow = "LOGIN" | "FORGOT_PASSWORD";

type PendingOtp = {
  flow: PendingInternalFlow;
  email: string;
  expiresAt: number;
  resendAt: number;
};

type PasswordResetState = {
  resetToken: string;
};

const OTP_KEY = "repairflow_internal_pending_otp";
const RESET_KEY = "repairflow_internal_password_reset";

export function savePendingInternalOtp(input: {
  flow: PendingInternalFlow;
  email: string;
  otpExpiresInSeconds?: number;
  resendAvailableInSeconds?: number;
}) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const value: PendingOtp = {
    flow: input.flow,
    email: input.email.trim().toLowerCase(),
    expiresAt: now + Number(input.otpExpiresInSeconds || 600) * 1000,
    resendAt: now + Number(input.resendAvailableInSeconds || 60) * 1000,
  };
  window.sessionStorage.setItem(OTP_KEY, JSON.stringify(value));
}

export function readPendingInternalOtp(flow?: PendingInternalFlow): PendingOtp | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(OTP_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as PendingOtp;
    if (flow && value.flow !== flow) return null;
    if (!value.email || !value.expiresAt) return null;
    return value;
  } catch {
    return null;
  }
}

export function updatePendingInternalOtpTiming(input: {
  otpExpiresInSeconds?: number;
  resendAvailableInSeconds?: number;
}) {
  const current = readPendingInternalOtp();
  if (!current || typeof window === "undefined") return;
  const now = Date.now();
  window.sessionStorage.setItem(
    OTP_KEY,
    JSON.stringify({
      ...current,
      expiresAt: now + Number(input.otpExpiresInSeconds || 600) * 1000,
      resendAt: now + Number(input.resendAvailableInSeconds || 60) * 1000,
    }),
  );
}

export function clearPendingInternalOtp() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(OTP_KEY);
}

export function saveInternalPasswordReset(resetToken: string) {
  if (typeof window === "undefined") return;
  const value: PasswordResetState = { resetToken };
  window.sessionStorage.setItem(RESET_KEY, JSON.stringify(value));
}

export function readInternalPasswordReset(): PasswordResetState | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(RESET_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as PasswordResetState;
    return value.resetToken ? value : null;
  } catch {
    return null;
  }
}

export function clearInternalPasswordReset() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(RESET_KEY);
}
