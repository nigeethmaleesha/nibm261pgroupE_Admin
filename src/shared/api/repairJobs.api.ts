import { requestJson } from "./http";
import type {
  AssignRepairJobResponse,
  CreateRepairJobPayload,
  CreateRepairJobResponse,
  CustomerLookupResponse,
  RepairJob,
  RepairJobDetailResponse,
  RepairJobSearchResponse,
} from "@/src/shared/types/repairJobs";

export function lookupRegisteredCustomers(query: string, limit = 10) {
  const params = new URLSearchParams({
    query: query.trim(),
    limit: String(limit),
  });

  return requestJson<CustomerLookupResponse>(
    `/staff/customers?${params.toString()}`,
    { method: "GET" },
  );
}

export function createRepairJob(
  payload: CreateRepairJobPayload,
  idempotencyKey: string,
) {
  return requestJson<CreateRepairJobResponse>(
    "/staff/jobs",
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    },
  );
}

// SCRUM-10: Owner/Staff shop-wide search by reference, customer name or phone.
export function searchRepairJobs(query = "", limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query.trim()) params.set("query", query.trim());

  return requestJson<RepairJobSearchResponse>(
    `/staff/jobs?${params.toString()}`,
    { method: "GET" },
  );
}

// SCRUM-10: full saved intake + current repair/assignment detail.
export function getRepairJobDetail(jobIdentifier: string) {
  const identifier = encodeURIComponent(jobIdentifier.trim());
  return requestJson<RepairJobDetailResponse>(
    `/staff/jobs/${identifier}`,
    { method: "GET" },
  );
}

// SCRUM-11: exact Jira assignment endpoint.
export function assignRepairJob(jobIdentifier: string, technicianId: string) {
  const identifier = encodeURIComponent(jobIdentifier.trim());
  return requestJson<AssignRepairJobResponse>(
    `/jobs/${identifier}/assign`,
    {
      method: "PATCH",
      body: JSON.stringify({ technicianId }),
    },
  );
}

// SCRUM-26 / SCRUM-116: Owner/Staff marks job Ready for Return unrepaired.
export interface MarkReadyForReturnPayload {
  returnReason: string;
  notes?: string;
  expectedRevision?: number;
}

export interface MarkReadyForReturnResponse {
  success: boolean;
  message: string;
  job: RepairJob;
  update?: any;
}

export function markJobReadyForReturn(
  jobIdentifier: string,
  payload: MarkReadyForReturnPayload,
) {
  const identifier = encodeURIComponent(jobIdentifier.trim());
  return requestJson<MarkReadyForReturnResponse>(
    `/staff/jobs/${identifier}/ready-for-return`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
