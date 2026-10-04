import type {
  ShopDashboardQueueRow,
  WorkloadCounts,
  WorkloadStatus,
} from "@/src/shared/types/dashboard";
import { requestJson } from "./http";

type ShopDashboardMetricsResponse = {
  summary: {
    awaitingApproval: number;
    waitingForParts: number;
    readyForCollection: number;
    readyForReturn: number;
  };
  queues: {
    awaitingApproval: ShopDashboardQueueRow[];
    waitingForParts: ShopDashboardQueueRow[];
    readyForCollection: ShopDashboardQueueRow[];
    readyForReturn: ShopDashboardQueueRow[];
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
  queues: Record<WorkloadStatus, ShopDashboardQueueRow[]>;
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

  return {
    counts: {
      "Awaiting Approval": response.summary.awaitingApproval,
      "Waiting for Parts": response.summary.waitingForParts,
      "Ready for Collection": response.summary.readyForCollection,
      "Ready for Return": response.summary.readyForReturn,
    },
    queues: {
      "Awaiting Approval": response.queues.awaitingApproval,
      "Waiting for Parts": response.queues.waitingForParts,
      "Ready for Collection": response.queues.readyForCollection,
      "Ready for Return": response.queues.readyForReturn,
    },
  } satisfies ShopDashboardMetrics;
}
