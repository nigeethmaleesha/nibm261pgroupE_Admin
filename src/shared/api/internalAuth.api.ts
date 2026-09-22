import { requestJson } from "./http";
import type {
  ForgotPasswordVerifyResponse,
  MeResponse,
  MessageResponse,
  OtpStartResponse,
  VerifyLoginResponse,
} from "@/src/shared/types/internal";

const post = <T>(path: string, body: unknown) =>
  requestJson<T>(
    path,
    { method: "POST", body: JSON.stringify(body) },
    { skipRefresh: true },
  );

export function loginInternal(payload: { email: string; password: string }) {
  return post<OtpStartResponse>("/internal/auth/login", payload);
}

export function verifyInternalLoginOtp(payload: { email: string; otp: string }) {
  return post<VerifyLoginResponse>("/internal/auth/login/verify-otp", payload);
}

export function resendInternalLoginOtp(payload: { email: string }) {
  return post<OtpStartResponse>("/internal/auth/login/resend-otp", payload);
}

export function initiateInternalForgotPassword(payload: { email: string }) {
  return post<OtpStartResponse>("/internal/auth/forgot-password/initiate", payload);
}

export function resendInternalForgotPasswordOtp(payload: { email: string }) {
  return post<OtpStartResponse>("/internal/auth/forgot-password/resend-otp", payload);
}

export function verifyInternalForgotPasswordOtp(payload: { email: string; otp: string }) {
  return post<ForgotPasswordVerifyResponse>(
    "/internal/auth/forgot-password/verify-otp",
    payload,
  );
}

export function changeInternalForgottenPassword(payload: {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return post<MessageResponse>("/internal/auth/forgot-password/change", payload);
}

export function getInternalProfile(skipRefresh = false) {
  return requestJson<MeResponse>(
    "/internal/auth/me",
    { method: "GET" },
    { skipRefresh },
  );
}
