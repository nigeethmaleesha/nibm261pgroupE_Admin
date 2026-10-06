"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getShopWorkDashboardMetrics } from "@/src/shared/api/dashboard.api";
import {
  WORKLOAD_STATUSES,
  type ShopWorkDashboardData,
  type ShopWorkDashboardFilters,
  type WorkloadStatus,
} from "@/src/shared/types/dashboard";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { WorkloadQueueTable } from "./WorkloadQueueTable";

const INITIAL_FILTERS: ShopWorkDashboardFilters = {
  technicianId: "ALL",
  dateFrom: "",
  dateTo: "",
  status: "ALL",
};

export function ShopWorkDashboard({ fullName }: { fullName: string }) {
  const [dashboardData, setDashboardData] = useState<ShopWorkDashboardData | null>(null);
  const [filters, setFilters] = useState<ShopWorkDashboardFilters>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const invalidDateRange = Boolean(
    filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo,
  );

  useEffect(() => {
    let active = true;

    if (invalidDateRange) {
      setError("Date from cannot be after date to.");
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getShopWorkDashboardMetrics(filters);
        if (active) setDashboardData(data);
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
  }, [filters, invalidDateRange, reloadKey]);

  const retryLoading = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6" aria-live="polite" aria-busy="true">
        <DashboardHeading fullName={fullName} onRefresh={retryLoading} refreshing />
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
            Loading live shop workload…
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <DashboardHeading fullName={fullName} onRefresh={retryLoading} refreshing={false} />
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
                disabled={invalidDateRange}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-rose-700 px-3 text-xs font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        </div>
        <DashboardFilters
          technicians={dashboardData?.technicians || []}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeading fullName={fullName} onRefresh={retryLoading} refreshing={false} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">Shop workload overview</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {dashboardData.total} matching {dashboardData.total === 1 ? "job" : "jobs"} across active workload queues.
          </p>
        </div>
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-emerald-700">
          Live data
        </span>
      </div>

      <DashboardFilters
        technicians={dashboardData.technicians}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      <DashboardKpiCards counts={dashboardData.counts} />

      {dashboardData.total === 0 && (
        <div role="status" className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-center">
          <p className="text-sm font-bold text-slate-800">No jobs match these filters</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            The live counts and workload queues are empty for the selected criteria.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {WORKLOAD_STATUSES.map((status: WorkloadStatus) => (
          <WorkloadQueueTable
            key={status}
            status={status}
            jobs={dashboardData.queues[status] || []}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardHeading({
  fullName,
  onRefresh,
  refreshing,
}: {
  fullName: string;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
        Refresh
      </button>
    </div>
  );
}
