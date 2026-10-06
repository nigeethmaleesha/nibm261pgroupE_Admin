"use client";

import { Calendar, Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import type { ArchiveFilterParams } from "@/src/shared/types/archive";

interface ArchiveSearchFiltersProps {
  filters: ArchiveFilterParams;
  totalResults: number;
  loading: boolean;
  onFilterChange: (newFilters: Partial<ArchiveFilterParams>) => void;
  onReset: () => void;
}

export function ArchiveSearchFilters({
  filters,
  totalResults,
  loading,
  onFilterChange,
  onReset,
}: ArchiveSearchFiltersProps) {
  // Preset helper
  const applyPreset = (preset: "today" | "7days" | "30days" | "thisMonth" | "all") => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    if (preset === "all") {
      onFilterChange({ startDate: "", endDate: "", page: 1 });
      return;
    }

    if (preset === "today") {
      const formatted = formatDate(today);
      onFilterChange({ startDate: formatted, endDate: formatted, page: 1 });
      return;
    }

    if (preset === "7days") {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      onFilterChange({ startDate: formatDate(past), endDate: formatDate(today), page: 1 });
      return;
    }

    if (preset === "30days") {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      onFilterChange({ startDate: formatDate(past), endDate: formatDate(today), page: 1 });
      return;
    }

    if (preset === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      onFilterChange({ startDate: formatDate(startOfMonth), endDate: formatDate(today), page: 1 });
    }
  };

  const hasActiveFilters = Boolean(
    filters.query?.trim() ||
    (filters.outcome && filters.outcome !== "all") ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
      {/* Top Row: Search & Outcome Filter */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="archive-search-input"
            type="text"
            value={filters.query || ""}
            onChange={(e) => onFilterChange({ query: e.target.value, page: 1 })}
            placeholder="Search by job reference (e.g. REP-2026), customer name, phone, or device model..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onFilterChange({ query: "", page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Outcome Selector Pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
          <button
            type="button"
            onClick={() => onFilterChange({ outcome: "all", page: 1 })}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              !filters.outcome || filters.outcome === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Closed
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ outcome: "repaired", page: 1 })}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              filters.outcome === "repaired"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Repaired
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ outcome: "unrepaired", page: 1 })}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              filters.outcome === "unrepaired"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 hover:text-amber-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Unrepaired Return
          </button>
        </div>
      </div>

      {/* Date Range & Quick Presets Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mr-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Collection Date:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFilterChange({ startDate: e.target.value, page: 1 })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              title="Start collection date"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFilterChange({ endDate: e.target.value, page: 1 })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
              title="End collection date"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="hidden sm:flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={() => applyPreset("today")}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyPreset("7days")}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset("30days")}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset("thisMonth")}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              This Month
            </button>
          </div>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-600">
            {loading ? (
              <span className="text-slate-400">Searching archive...</span>
            ) : (
              <span>
                Found <strong className="text-slate-900">{totalResults}</strong> closed {totalResults === 1 ? "record" : "records"}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
