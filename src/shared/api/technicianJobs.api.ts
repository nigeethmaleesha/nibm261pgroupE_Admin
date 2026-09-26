import { requestJson } from "./http";
import type {
  TechnicianJobListResponse,
  TechnicianJobDetailResponse,
} from "@/src/shared/types/technicianJobs";

/**
 * SCRUM-41: Fetch all repair jobs assigned to the authenticated technician.
 * Proxied to backend GET /api/technician/jobs with HttpOnly auth cookies.
 */
export function fetchAssignedTechnicianJobs() {
  return requestJson<TechnicianJobListResponse>("/technician/jobs", {
    method: "GET",
  });
}

/**
 * SCRUM-41: Fetch technical detail of a specific repair job assigned to the authenticated technician.
 * Proxied to backend GET /api/technician/jobs/:jobIdentifier with HttpOnly auth cookies.
 * Returns HTTP 403 if the job is unassigned or assigned to a different technician.
 */
export function fetchAssignedTechnicianJobDetail(jobIdentifier: string) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<TechnicianJobDetailResponse>(`/technician/jobs/${sanitized}`, {
    method: "GET",
  });
}

/**
 * Technician progress update & fault note logger.
 * Proxied to backend PATCH /api/technician/jobs/:jobIdentifier/progress
 */
export function updateTechnicianJobProgress(
  jobIdentifier: string,
  payload: { status?: string; note?: string; expectedRevision?: number },
) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<{ message: string; job: any; update: any }>(
    `/technician/jobs/${sanitized}/progress`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Fetch progress and notes history for assigned technician job.
 * Proxied to backend GET /api/technician/jobs/:jobIdentifier/progress
 */
export function fetchTechnicianJobProgressHistory(jobIdentifier: string) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<{
    job: any;
    isLocked: boolean;
    allowedStatuses: string[];
    updates: any[];
  }>(`/technician/jobs/${sanitized}/progress`, {
    method: "GET",
  });
}
