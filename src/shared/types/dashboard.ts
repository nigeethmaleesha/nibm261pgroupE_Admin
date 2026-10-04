export const WORKLOAD_STATUSES = [
  "Awaiting Approval",
  "Waiting for Parts",
  "Ready for Collection",
  "Ready for Return",
] as const;

export type WorkloadStatus = (typeof WORKLOAD_STATUSES)[number];
export type DashboardStatusFilter = "ALL" | WorkloadStatus;

export type ShopWorkJob = {
  id: string;
  reference: string;
  customer: string;
  device: string;
  assignedTechnician: string;
  receivedAt: string;
  status: WorkloadStatus;
};

export type ShopWorkDashboardData = {
  jobs: ShopWorkJob[];
  technicians: string[];
};

export type ShopWorkDashboardFilters = {
  technician: string;
  dateFrom: string;
  dateTo: string;
  status: DashboardStatusFilter;
};

export type WorkloadCounts = Record<WorkloadStatus, number>;
