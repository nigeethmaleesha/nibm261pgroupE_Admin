import { requestJson } from "./http";
import type {
  ShopWorkDashboardData,
  ShopWorkDashboardFilters,
} from "@/src/shared/types/dashboard";

export function getShopWorkDashboardMetrics(filters: ShopWorkDashboardFilters) {
  const params = new URLSearchParams();

  if (filters.technicianId !== "ALL") {
    params.set("technicianId", filters.technicianId);
  }
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.status !== "ALL") params.set("status", filters.status);

  const query = params.toString();
  return requestJson<ShopWorkDashboardData>(
    `/staff/dashboard/metrics${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}
