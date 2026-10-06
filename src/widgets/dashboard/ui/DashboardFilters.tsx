import { CalendarDays, RotateCcw } from "lucide-react";
import {
  WORKLOAD_STATUSES,
  type DashboardStatusFilter,
  type ShopWorkDashboardFilters,
  type ShopWorkTechnician,
} from "@/src/shared/types/dashboard";

type DashboardFiltersProps = {
  technicians: ShopWorkTechnician[];
  filters: ShopWorkDashboardFilters;
  onChange: (filters: ShopWorkDashboardFilters) => void;
  onReset: () => void;
};

const selectClassName =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const labelClassName = "text-xs font-bold text-slate-600";

function isDashboardStatusFilter(value: string): value is DashboardStatusFilter {
  return value === "ALL" || WORKLOAD_STATUSES.some((status) => status === value);
}

export function DashboardFilters({
  technicians,
  filters,
  onChange,
  onReset,
}: DashboardFiltersProps) {
  const update = (key: keyof ShopWorkDashboardFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section
      aria-labelledby="dashboard-filters-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="dashboard-filters-heading" className="text-sm font-extrabold text-slate-900">
            Filter workload
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Filters are applied on the server to both KPI counts and queue rows.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-3.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset filters
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className={labelClassName}>
          Technician
          <select
            value={filters.technicianId}
            onChange={(event) => update("technicianId", event.target.value)}
            className={selectClassName}
          >
            <option value="ALL">All technicians</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.fullName}{technician.isActive ? "" : " (Disabled)"}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClassName}>
          Date from
          <span className="relative mt-1.5 block">
            <CalendarDays
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => update("dateFrom", event.target.value)}
              className={`${selectClassName} mt-0 pl-9`}
            />
          </span>
        </label>

        <label className={labelClassName}>
          Date to
          <span className="relative mt-1.5 block">
            <CalendarDays
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="date"
              value={filters.dateTo}
              min={filters.dateFrom || undefined}
              onChange={(event) => update("dateTo", event.target.value)}
              className={`${selectClassName} mt-0 pl-9`}
            />
          </span>
        </label>

        <label className={labelClassName}>
          Status
          <select
            value={filters.status}
            onChange={(event) => {
              const value = event.target.value;
              if (isDashboardStatusFilter(value)) update("status", value);
            }}
            className={selectClassName}
          >
            <option value="ALL">All statuses</option>
            {WORKLOAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      {filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo && (
        <p role="status" className="mt-3 text-xs font-semibold text-amber-700">
          Date from cannot be after date to. Adjust the range to refresh the dashboard.
        </p>
      )}
    </section>
  );
}
