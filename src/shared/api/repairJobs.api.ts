import { requestJson } from "./http";
import type {
  CreateRepairJobPayload,
  CreateRepairJobResponse,
  CustomerLookupResponse,
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
