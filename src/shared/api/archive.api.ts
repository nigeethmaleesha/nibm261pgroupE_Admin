import { requestJson } from "./http";
import type {
  ArchivedJobDossier,
  ArchivedJobSearchResponse,
  ArchiveFilterParams,
} from "@/src/shared/types/archive";

/**
 * SCRUM-127: Owner/Staff search and list archived / closed repair jobs with date-range and outcome filters.
 */
export function searchArchivedJobs(params: ArchiveFilterParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.query?.trim()) {
    queryParams.set("query", params.query.trim());
  }
  if (params.outcome && params.outcome !== "all") {
    queryParams.set("outcome", params.outcome);
  }
  if (params.startDate) {
    queryParams.set("startDate", params.startDate);
  }
  if (params.endDate) {
    queryParams.set("endDate", params.endDate);
  }
  if (params.page) {
    queryParams.set("page", String(params.page));
  }
  if (params.limit) {
    queryParams.set("limit", String(params.limit));
  }

  const queryStr = queryParams.toString();
  return requestJson<ArchivedJobSearchResponse>(
    `/staff/jobs/archived${queryStr ? `?${queryStr}` : ""}`,
    { method: "GET" },
  );
}

/**
 * SCRUM-128 / SCRUM-129: Complete read-only job dossier with full audit trail and chronological event ledger.
 */
export function getArchivedJobDetail(jobIdentifier: string) {
  const identifier = encodeURIComponent(jobIdentifier.trim());
  return requestJson<ArchivedJobDossier>(
    `/staff/jobs/archived/${identifier}`,
    { method: "GET" },
  );
}
