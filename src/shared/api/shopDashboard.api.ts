import type { RepairJobSearchItem } from "@/src/shared/types/repairJobs";
import type { ShopWorkJob, WorkloadCounts, WorkloadStatus } from "@/src/shared/types/dashboard";
import { requestJson } from "./http";

type ShopDashboardMetricsResponse = {
  summary: {
    awaitingApproval: number;
    waitingForParts: number;
    readyForCollection: number;
    readyForReturn: number;
  };
  queues: {
    awaitingApproval: RepairJobSearchItem[];
    waitingForParts: RepairJobSearchItem[];
    readyForCollection: RepairJobSearchItem[];
    readyForReturn: RepairJobSearchItem[];
  };
};

export type ShopDashboardFilters = {
  technicianId?: string;
  from?: string;
  to?: string;
  status?: string;
};

export type ShopDashboardMetrics = {
  counts: WorkloadCounts;
  queues: Record<WorkloadStatus, ShopWorkJob[]>;
};

export async function getShopDashboardMetrics(filters: ShopDashboardFilters = {}) {
  const params = new URLSearchParams();
  if (filters.technicianId) params.set("technicianId", filters.technicianId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const response = await requestJson<ShopDashboardMetricsResponse>(
    `/staff/dashboard/metrics${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  const mapQueue = (
    jobs: RepairJobSearchItem[],
    status: WorkloadStatus,
  ): ShopWorkJob[] =>
    jobs.map((job) => ({
      id: job.id,
      reference: job.reference,
      customer: job.customer.fullName,
      device: [job.deviceType, job.makeModel].filter(Boolean).join(" / "),
      assignedTechnician: job.assignedTechnician?.fullName ?? "Unassigned",
      receivedAt: job.receivedAt,
      status,
    }));

  return {
    counts: {
      "Awaiting Approval": response.summary.awaitingApproval,
      "Waiting for Parts": response.summary.waitingForParts,
      "Ready for Collection": response.summary.readyForCollection,
      "Ready for Return": response.summary.readyForReturn,
    },
    queues: {
      "Awaiting Approval": mapQueue(response.queues.awaitingApproval, "Awaiting Approval"),
      "Waiting for Parts": mapQueue(response.queues.waitingForParts, "Waiting for Parts"),
      "Ready for Collection": mapQueue(response.queues.readyForCollection, "Ready for Collection"),
      "Ready for Return": mapQueue(response.queues.readyForReturn, "Ready for Return"),
    },
  } satisfies ShopDashboardMetrics;
}
