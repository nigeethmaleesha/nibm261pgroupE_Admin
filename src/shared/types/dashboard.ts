export const WORKLOAD_STATUSES = [
  "Awaiting Approval",
  "Waiting for Parts",
  "Ready for Collection",
  "Ready for Return",
] as const;

export type WorkloadStatus = (typeof WORKLOAD_STATUSES)[number];
export type DashboardStatusFilter = "ALL" | WorkloadStatus;

export type ShopWorkTechnician = {
  id: string;
  fullName: string;
  isActive: boolean;
};

export type ShopWorkJob = {
  id: string;
  reference: string;
  customer: string;
  deviceType: string;
  makeModel: string;
  device: string;
  assignedTechnician: Pick<ShopWorkTechnician, "id" | "fullName"> | null;
  receivedAt: string;
  status: WorkloadStatus;
};

export type WorkloadCounts = Record<WorkloadStatus, number>;
export type WorkloadQueues = Record<WorkloadStatus, ShopWorkJob[]>;

export type ShopWorkDashboardData = {
  filters: {
    technicianId: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    status: WorkloadStatus | null;
  };
  counts: WorkloadCounts;
  queues: WorkloadQueues;
  technicians: ShopWorkTechnician[];
  total: number;
  generatedAt: string;
};

export type ShopWorkDashboardFilters = {
  technicianId: string;
  dateFrom: string;
  dateTo: string;
  status: DashboardStatusFilter;
};
