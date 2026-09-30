import type { RepairJob } from "./repairJobs";

export type TechnicianJobStatus =
  | "Received"
  | "Diagnosing"
  | "Awaiting Approval"
  | "Approved"
  | "In Repair"
  | "Waiting for Parts"
  | "Ready for Collection"
  | "Ready for Return"
  | "Collected"
  | string;

export type TechnicianJobPriority = "High" | "Normal" | "Low";

export type TechnicianJobListItem = {
  id: string;
  reference: string;
  deviceType: string;
  makeModel: string;
  reportedFault: string;
  status: TechnicianJobStatus;
  receivedAt: string;
  // Optional enriched / display fields
  customerName?: string;
  category?: string;
  priority?: TechnicianJobPriority;
  holdReason?: string;
  subStatus?: string;
  benchTimeMinutes?: number;
  slaDeadline?: string;
  triageNumber?: string;
};

export type TechnicianJobListResponse = {
  count: number;
  jobs: TechnicianJobListItem[];
};

export type TechnicianJobDetailResponse = {
  job: RepairJob;
};

export type DashboardStatusFilter =
  | "ALL"
  | "DIAGNOSIS_PENDING"
  | "IN_PROGRESS"
  | "WAITING_FOR_PARTS"
  | "COMPLETED";

export type DashboardPriorityFilter = "ALL" | "HIGH" | "NORMAL" | "LOW";

export type RepairJobPartsHold = {
  active: boolean;
  reason: string | null;
  placedAt: string | null;
  releasedAt: string | null;
  releasedBy: string | null;
};

export type RepairJobWork = {
  firstStartedAt: string | null;
  firstStartedBy: string | null;
  lastAction: "START" | "RESUME" | null;
  lastStartedAt: string | null;
  lastStartedBy: string | null;
  approvedEstimateId: string | null;
  approvedEstimateVersion: number | null;
};

// Slim job snapshot returned by the progress/start-repair/parts-hold endpoints
// (a subset of RepairJob, not the full detail payload).
export type RepairProgressJobSnapshot = {
  id: string;
  reference: string;
  status: TechnicianJobStatus;
  revision: number;
  partsHold: RepairJobPartsHold;
  repairWork: RepairJobWork;
};

export type RepairWorkAuthorisation = {
  latestVersionNumber: number | null;
  approvedVersionNumber: number | null;
  approvedEstimateId: string | null;
  partsHoldActive: boolean;
  canContinueRepair: boolean;
  canStartRepair: boolean;
  canComplete: boolean;
  repairBlockedReasons: string[];
  startBlockedReasons: string[];
  completionBlockedReasons: string[];
};

export type RepairProgressUpdateRecord = {
  id: string;
  fromStatus: string;
  toStatus: string;
  statusChanged: boolean;
  note: string | null;
  estimateVersionNumber: number | null;
  updatedBy: string;
  updatedByRole: string;
  createdAt: string;
};

export type TechnicianJobProgressHistoryResponse = {
  job: RepairProgressJobSnapshot;
  canStartRepair: boolean;
  startBlockedReasons: string[];
  workAuthorisation: RepairWorkAuthorisation;
  isLocked: boolean;
  allowedStatuses: string[];
  updates: RepairProgressUpdateRecord[];
};

export type RepairProgressMutationResponse = {
  message: string;
  job: RepairProgressJobSnapshot;
  update: RepairProgressUpdateRecord;
};

// Technician work log while In Repair: `workNote` is internal only,
// `publicUpdate` is the customer-safe text. Entries are immutable; a
// correction is a new entry that points to the original via `correctionOf`.
export type RepairWorkNoteEntry = {
  id: string;
  workNote: string;
  publicUpdate: string;
  estimateId: string;
  estimateVersionNumber: number;
  jobStatus: string;
  recordedBy: { id: string; fullName: string | null };
  recordedByRole: string;
  recordedAt: string;
  isCorrection: boolean;
  correctionOf: string | null;
  correctionReason: string | null;
  correctedBy: string | null;
  isCurrent: boolean;
};

export type RepairWorkNotesResponse = {
  job: { id: string; reference: string; status: string; revision: number };
  approvedVersionNumber: number | null;
  canRecord: boolean;
  recordBlockedReasons: string[];
  entries: RepairWorkNoteEntry[];
};

export type RecordWorkNotePayload = {
  workNote: string;
  publicUpdate: string;
  estimateVersionNumber?: number;
  correctionOf?: string;
  correctionReason?: string;
};

export type RecordWorkNoteResponse = {
  created: boolean;
  idempotentReplay: boolean;
  message: string;
  entry: RepairWorkNoteEntry;
};
