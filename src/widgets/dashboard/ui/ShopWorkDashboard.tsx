"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  WORKLOAD_STATUSES,
  type ShopWorkDashboardFilters,
  type WorkloadStatus,
} from "@/src/shared/types/dashboard";
import { getTechnicians } from "@/src/shared/api/technicians.api";
import {
  getShopDashboardMetrics,
  type ShopDashboardMetrics,
} from "@/src/shared/api/shopDashboard.api";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { WorkloadQueueTable } from "./WorkloadQueueTable";

const INITIAL_FILTERS: ShopWorkDashboardFilters = {
  technician: "ALL",
  dateFrom: "",
  dateTo: "",
  status: "ALL",
};

export function ShopWorkDashboard({ fullName }: { fullName: string }) {
  const [dashboardData, setDashboardData] = useState<ShopDashboardMetrics | null>(null);
  const [technicians, setTechnicians] = useState<{ id: string; fullName: string }[]>([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [metrics, technicianResponse] = await Promise.all([
          getShopDashboardMetrics({
            technicianId: filters.technician === "ALL" ? undefined : filters.technician,
            from: filters.dateFrom || undefined,
            to: filters.dateTo || undefined,
            status: filters.status === "ALL" ? undefined : filters.status,
          }),
          getTechnicians("active"),
        ]);
        if (!active) return;
        setDashboardData(metrics);
        setTechnicians(
          technicianResponse.technicians.map(({ id, fullName: technicianName }) => ({
            id,
            fullName: technicianName,
          })),
        );
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the shop workload dashboard.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [filters, reloadKey]);

  const retryLoading = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6" aria-live="polite" aria-busy="true">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
            Owner / Staff
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
            Shop work dashboard
          </h1>
        </div>
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
            Loading shop workload…
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <DashboardHeading fullName={fullName} />
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="text-sm font-extrabold text-rose-900">Dashboard could not be loaded</h2>
              <p className="mt-1 text-sm font-medium text-rose-800">
                {error || "Dashboard data is unavailable."}
              </p>
              <button
                type="button"
                onClick={retryLoading}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-rose-700 px-3 text-xs font-bold text-white transition hover:bg-rose-800"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeading fullName={fullName} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-slate-800">Shop workload overview</h2>
      </div>

      <DashboardFilters
        technicians={technicians}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      <DashboardKpiCards counts={dashboardData.counts} />

      {WORKLOAD_STATUSES.every((status) => dashboardData.queues[status].length === 0) && (
        <div role="status" className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-center">
          <p className="text-sm font-bold text-slate-800">No jobs match these filters</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Adjust the technician, date range, or status to see matching workload.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {WORKLOAD_STATUSES.map((status: WorkloadStatus) => (
          <WorkloadQueueTable
            key={status}
            status={status}
            jobs={dashboardData.queues[status]}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardHeading({ fullName }: { fullName: string }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
        Owner / Staff
      </p>
      <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
        Shop work dashboard
      </h1>
      <p className="mt-2 text-sm font-medium text-slate-500">
        Welcome, {fullName}. Review active workload and repair queues.
      </p>
    </div>
  );
}
