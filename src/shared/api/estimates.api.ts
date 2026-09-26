import { requestJson } from "./http";
import type {
  EstimateContextResponse,
  EstimateHistoryResponse,
  IssueEstimatePayload,
  IssueEstimateResponse,
  IssueRevisionPayload,
  ProgressHistoryResponse,
} from "@/src/shared/types/estimates";

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


