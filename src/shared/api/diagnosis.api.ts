import { requestJson } from "./http";
import type {
  DiagnosisContextResponse,
  DiagnosisMutationResponse,
  SaveDiagnosisPayload,
} from "@/src/shared/types/diagnosis";

function encodedJobIdentifier(jobIdentifier: string) {
  return encodeURIComponent(jobIdentifier.trim());
}

export function fetchTechnicianDiagnosis(jobIdentifier: string) {
  const id = encodedJobIdentifier(jobIdentifier);
  return requestJson<DiagnosisContextResponse>(`/technician/jobs/${id}/diagnosis`, {
    method: "GET",
  });
}

export function startTechnicianDiagnosis(jobIdentifier: string) {
  const id = encodedJobIdentifier(jobIdentifier);
  return requestJson<DiagnosisMutationResponse>(
    `/technician/jobs/${id}/diagnosis/start`,
    { method: "POST" },
  );
}

export function saveTechnicianDiagnosis(
  jobIdentifier: string,
  payload: SaveDiagnosisPayload,
) {
  const id = encodedJobIdentifier(jobIdentifier);
  return requestJson<DiagnosisMutationResponse>(`/technician/jobs/${id}/diagnosis`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
