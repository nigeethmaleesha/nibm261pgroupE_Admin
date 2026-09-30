import { requestJson } from "./http";
import type {
  EstimateContextResponse,
  EstimateHistoryResponse,
  IssueEstimatePayload,
  IssueEstimateResponse,
  IssueRevisionPayload,
  ProgressHistoryResponse,
} from "@/src/shared/types/estimates";
import type { RepairProgressMutationResponse } from "@/src/shared/types/technicianJobs";

export function getEstimateContext(jobIdentifier: string) {
  return requestJson<EstimateContextResponse>(
    `/staff/jobs/${encodeURIComponent(jobIdentifier.trim())}/estimate-context`,
    { method: "GET" },
  );
}

export function issueInitialEstimate(jobIdentifier: string, payload: IssueEstimatePayload) {
  return requestJson<IssueEstimateResponse>(
    `/staff/jobs/${encodeURIComponent(jobIdentifier.trim())}/estimates`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function issueRevisedEstimate(jobIdentifier: string, payload: IssueRevisionPayload) {
  return requestJson<IssueEstimateResponse>(
    `/staff/jobs/${encodeURIComponent(jobIdentifier.trim())}/estimate-revisions`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function fetchStaffProgressHistory(jobIdentifier: string) {
  return requestJson<ProgressHistoryResponse>(
    `/staff/jobs/${encodeURIComponent(jobIdentifier.trim())}/progress`,
    { method: "GET" },
  );
}

export function getEstimateHistory(jobIdentifier: string) {
  return requestJson<EstimateHistoryResponse>(
    `/staff/jobs/${encodeURIComponent(jobIdentifier.trim())}/estimates`,
    { method: "GET" },
  );
}

/**
 * Resolve an active parts hold from the Owner/Staff side (parts have
 * arrived). Does not change job status; the assigned technician then
 * resumes repair work.
 * Proxied to backend PATCH /api/staff/jobs/:jobIdentifier/parts-hold/resolve
 */
export function resolveStaffPartsHold(
  jobIdentifier: string,
  payload: { note?: string; expectedRevision?: number } = {},
) {
  return requestJson<RepairProgressMutationResponse>(
    `/staff/jobs/${encodeURIComponent(jobIdentifier.trim())}/parts-hold/resolve`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}


