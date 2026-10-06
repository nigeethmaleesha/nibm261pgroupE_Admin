export type DiagnosisState = "Diagnosing" | "Diagnosis Recorded";

export type DiagnosisRecord = {
  id: string;
  state: DiagnosisState | string;
  findings: string;
  recommendedWork: string;
  publicSummary: string;
  internalNotes: string;
  isUnrepairable: boolean;
  unrepairableReason: string | null;
  startedAt: string;
  startedBy: string;
  lastUpdatedBy: string | null;
  completedAt: string | null;
  completedBy: string | null;
  isCompleted: boolean;
  updatedAt: string;
};

export type DiagnosisJobState = {
  id: string;
  reference: string;
  status: string;
  revision: number;
  diagnosisState: "Not Started" | "Diagnosing" | "Diagnosis Recorded" | string;
  diagnosisStartedAt: string | null;
  diagnosisRecordedAt: string | null;
};

export type DiagnosisContextResponse = {
  job: DiagnosisJobState;
  diagnosis: DiagnosisRecord | null;
  permissions: {
    canStart: boolean;
    canEdit: boolean;
    canComplete: boolean;
  };
};

export type DiagnosisMutationResponse = {
  started?: boolean;
  completed?: boolean;
  idempotentReplay?: boolean;
  message: string;
  job: DiagnosisJobState;
  diagnosis: DiagnosisRecord;
};

export type SaveDiagnosisPayload = {
  findings?: string;
  recommendedWork?: string;
  publicSummary?: string;
  internalNotes?: string;
  isUnrepairable?: boolean;
  unrepairableReason?: string | null;
  complete?: boolean;
};
