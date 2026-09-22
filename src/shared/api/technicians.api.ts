import { requestJson } from "./http";
import type {
  OtpStartResponse,
  TechnicianCreateResponse,
  TechnicianListResponse,
  TechnicianToggleResponse,
  VerifyAccountResponse,
} from "@/src/shared/types/internal";

export function createTechnician(payload: {
  fullName: string;
  email: string;
  contactNumber: string;
  password: string;
}) {
  return requestJson<TechnicianCreateResponse>(
    "/staff/technicians",
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function verifyTechnicianAccount(payload: { email: string; otp: string }) {
  return requestJson<VerifyAccountResponse>(
    "/staff/technicians/verify-otp",
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function resendTechnicianAccountOtp(payload: { email: string }) {
  return requestJson<OtpStartResponse>(
    "/staff/technicians/resend-otp",
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function getTechnicians(status: "active" | "disabled" | "all" = "all") {
  return requestJson<TechnicianListResponse>(
    `/staff/technicians?status=${status}`,
    { method: "GET" },
  );
}

export function toggleTechnicianActive(technicianId: string) {
  return requestJson<TechnicianToggleResponse>(
    `/staff/technicians/${technicianId}/toggle-active`,
    { method: "PATCH" },
  );
}
