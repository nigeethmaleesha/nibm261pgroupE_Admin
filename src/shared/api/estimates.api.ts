import { requestJson } from "./http";
import type {
  EstimateContextResponse,
  IssueEstimatePayload,
  IssueEstimateResponse,
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
