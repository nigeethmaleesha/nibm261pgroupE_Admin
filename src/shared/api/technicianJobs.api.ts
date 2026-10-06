import { requestJson } from "./http";
import type {
  TechnicianJobListResponse,
  TechnicianJobDetailResponse,
  TechnicianJobProgressHistoryResponse,
  RepairProgressMutationResponse,
  PlacePartsHoldPayload,
  ResolvePartsHoldPayload,
  RepairWorkNotesResponse,
  RecordWorkNotePayload,
  RecordWorkNoteResponse,
  CompleteRepairPayload,
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
 * Fetch progress and notes history for assigned technician job. Also carries
 * the current parts-hold flags and repair work authorisation used to gate
 * the Start Repair / Resume Work actions.
 * Proxied to backend GET /api/technician/jobs/:jobIdentifier/progress
 */
export function fetchTechnicianJobProgressHistory(jobIdentifier: string) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<TechnicianJobProgressHistoryResponse>(
    `/technician/jobs/${sanitized}/progress`,
    { method: "GET" },
  );
}

/**
 * Start or resume repair work on the assigned technician's job. Only allowed
 * when the job is Approved (start) or Waiting for Parts with the hold
 * resolved (resume); the backend rechecks both atomically on save.
 * `estimateVersionNumber` is the approved version shown on screen; the backend
 * returns 409 ESTIMATE_SUPERSEDED if a newer version exists.
 * Proxied to backend POST /api/technician/jobs/:jobIdentifier/start-repair
 */
export function startOrResumeTechnicianRepair(
  jobIdentifier: string,
  payload: { note?: string; expectedRevision?: number; estimateVersionNumber?: number } = {},
) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<RepairProgressMutationResponse>(
    `/technician/jobs/${sanitized}/start-repair`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Work notes (internal) and customer-safe updates for the assigned job, plus
 * whether a new entry can be recorded right now.
 * Proxied to backend GET /api/technician/jobs/:jobIdentifier/progress-updates
 */
export function fetchTechnicianWorkNotes(jobIdentifier: string) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<RepairWorkNotesResponse>(
    `/technician/jobs/${sanitized}/progress-updates`,
    { method: "GET" },
  );
}

/**
 * Record a work note + customer-safe update while the job is In Repair. The
 * same `idempotencyKey` must be reused when retrying the same submit so the
 * backend replays the saved entry instead of creating a duplicate.
 * Proxied to backend POST /api/technician/jobs/:jobIdentifier/progress-updates
 */
export function recordTechnicianWorkNote(
  jobIdentifier: string,
  payload: RecordWorkNotePayload,
  idempotencyKey: string,
) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<RecordWorkNoteResponse>(
    `/technician/jobs/${sanitized}/progress-updates`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Place the assigned technician's In Repair job on a parts hold. The backend
 * requires both the required part and a customer-safe delay reason.
 * Proxied to backend POST /api/technician/jobs/:jobIdentifier/parts-hold
 */
export function placeTechnicianPartsHold(
  jobIdentifier: string,
  payload: PlacePartsHoldPayload,
) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<RepairProgressMutationResponse>(
    `/technician/jobs/${sanitized}/parts-hold`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Resolve an active parts hold on the assigned technician's job (parts have
 * arrived). The job status is deliberately left unchanged; Waiting for Parts
 * requires an explicit Resume Work action, while Awaiting Approval stays locked.
 * Proxied to backend POST /api/technician/jobs/:jobIdentifier/resolve-parts-hold
 */
export function resolveTechnicianPartsHold(
  jobIdentifier: string,
  payload: ResolvePartsHoldPayload = {},
) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<RepairProgressMutationResponse>(
    `/technician/jobs/${sanitized}/resolve-parts-hold`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * SCRUM-25 / SCRUM-111 / SCRUM-112:
 * Complete repair with Quality Control Checklist verification.
 * Proxied to backend POST /api/technician/jobs/:jobIdentifier/complete
 */
export function completeTechnicianRepair(
  jobIdentifier: string,
  payload: CompleteRepairPayload,
) {
  const sanitized = encodeURIComponent(jobIdentifier.trim());
  return requestJson<RepairProgressMutationResponse>(
    `/technician/jobs/${sanitized}/complete`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
