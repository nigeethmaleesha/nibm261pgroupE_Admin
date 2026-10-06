"use client";

import { useState } from "react";
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Laptop,
  Phone,
  ShieldCheck,
  Smartphone,
  UserCheck,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import type { ArchivedJobSummary } from "@/src/shared/types/archive";

interface ArchivedJobsListProps {
  jobs: ArchivedJobSummary[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onSelectJob: (jobIdentifier: string) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ArchivedJobsList({
  jobs,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onSelectJob,
}: ArchivedJobsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyReference = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedId(ref);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 rounded-lg bg-slate-200" />
              <div className="h-5 w-24 rounded-lg bg-slate-200" />
            </div>
            <div className="h-4 w-64 rounded bg-slate-100" />
            <div className="h-3 w-48 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Archive className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-sm font-extrabold text-slate-900">
          No Archived Repair Records Found
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          No closed jobs match your current search terms or date filter. Try expanding your date range or clearing filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* List Cards */}
      <div className="grid gap-3">
        {jobs.map((job) => {
          const isRepaired = job.outcome === "repaired";

          return (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.reference || job.id)}
              className="group relative cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                {/* Left Column: Reference & Device info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Job Reference */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black tracking-tight text-slate-800">
                      <span>{job.reference}</span>
                      <button
                        type="button"
                        onClick={(e) => copyReference(job.reference, e)}
                        title="Copy Reference"
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {copiedId === job.reference && (
                        <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                      )}
                    </div>

                    {/* Outcome Badge */}
                    {isRepaired ? (
                      <span className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Repaired & Collected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                        <XCircle className="h-3 w-3" />
                        Unrepaired Return
                      </span>
                    )}

                    {/* Device Type Tag */}
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {job.device.deviceType}
                    </span>
                  </div>

                  {/* Make/Model & Fault */}
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition">
                      {job.device.makeModel}
                    </h4>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">Reported Fault:</span> {job.device.reportedFault}
                    </p>
                    {job.returnReason && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-amber-700 font-medium">
                        <span className="font-bold">Return Reason:</span> {job.returnReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center Column: Customer info */}
                <div className="flex min-w-[200px] flex-col gap-1 rounded-xl bg-slate-50/80 p-3 text-xs border border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <UserRound className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{job.customer.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{job.customer.contactNumber}</span>
                  </div>
                  {job.customer.email && (
                    <span className="truncate text-[11px] text-slate-400">
                      {job.customer.email}
                    </span>
                  )}
                </div>

                {/* Right Column: Handover Details & Dossier CTA */}
                <div className="flex flex-col sm:items-end justify-between gap-3 text-right">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:justify-end">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Closed: {formatDate(job.handover?.collectedAt || job.closedAt)}</span>
                    </div>
                    {job.handover?.collectedBy && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 sm:justify-end">
                        <UserCheck className="h-3 w-3 text-slate-400" />
                        <span>Staff: {job.handover.collectedBy.fullName}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectJob(job.reference || job.id);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
                  >
                    <span>View Dossier</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/90 pt-4 px-2">
          <p className="text-xs font-medium text-slate-500">
            Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({total} total closed records)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
