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
