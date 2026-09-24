"use client";

import { CalendarDays, ChevronRight, CircleUserRound, Cpu, SearchX, UserRound } from "lucide-react";
import type { RepairJobSearchItem } from "@/src/shared/types/repairJobs";

function statusClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "collected") return "border-slate-200 bg-slate-100 text-slate-600";
  if (normalized.includes("ready")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized.includes("waiting") || normalized.includes("awaiting")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (normalized.includes("repair") || normalized === "approved") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }
  if (normalized.includes("diagnos")) return "border-cyan-200 bg-cyan-50 text-cyan-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface RepairJobSearchListProps {
  jobs: RepairJobSearchItem[];
  selectedId: string | null;
  loading: boolean;
  query: string;
  onSelect: (job: RepairJobSearchItem) => void;
}

export function RepairJobSearchList({
  jobs,
  selectedId,
  loading,
  query,
  onSelect,
}: RepairJobSearchListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-900">No repair jobs found</h3>
        <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
          {query.trim()
            ? `No jobs match “${query.trim()}”. Try a job reference, customer name, or contact number.`
            : "There are no repair jobs matching the selected filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const active = selectedId === job.id;
        return (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelect(job)}
            className={`w-full rounded-2xl border p-4 text-left transition ${
              active
                ? "border-blue-300 bg-blue-50/65 shadow-[0_10px_26px_rgba(37,99,235,0.10)]"
                : "border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)] hover:border-blue-200 hover:bg-blue-50/25"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[13px] font-black tracking-wide text-slate-950">
                    {job.reference}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${statusClasses(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[13px] font-extrabold text-slate-800">
                  <Cpu className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="truncate">{job.deviceType} · {job.makeModel}</span>
                </div>
              </div>
              <ChevronRight className={`mt-1 h-5 w-5 shrink-0 ${active ? "text-blue-600" : "text-slate-300"}`} />
            </div>

            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div className="flex items-center gap-2 text-slate-500">
                <CircleUserRound className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-semibold">{job.customer.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <UserRound className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-semibold">
                  {job.assignedTechnician?.fullName || "Unassigned"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 sm:col-span-2">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">Received {formatDate(job.receivedAt)}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
