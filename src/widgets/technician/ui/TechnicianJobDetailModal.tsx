"use client";

import { useEffect, useState } from "react";
import {
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Cpu,
  Hash,
  Laptop,
  Mail,
  Phone,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Tablet,
  User,
  Wrench,
  X,
} from "lucide-react";
import { fetchAssignedTechnicianJobDetail } from "@/src/shared/api/technicianJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type { RepairJob } from "@/src/shared/types/repairJobs";

interface TechnicianJobDetailModalProps {
  jobIdentifier: string | null;
  initialJobSummary?: {
    reference: string;
    deviceType: string;
    makeModel: string;
    reportedFault: string;
    status: string;
    receivedAt: string;
  } | null;
  onClose: () => void;
}

function DeviceIconRenderer({ deviceType, className }: { deviceType: string; className?: string }) {
  const lower = deviceType.toLowerCase();
  if (lower.includes("phone") || lower.includes("mobile") || lower.includes("cellular")) {
    return <Smartphone className={className} />;
  }
  if (lower.includes("tablet") || lower.includes("ipad")) {
    return <Tablet className={className} />;
  }
  if (lower.includes("laptop") || lower.includes("notebook") || lower.includes("macbook")) {
    return <Laptop className={className} />;
  }
  return <Cpu className={className} />;
}

function getStatusBadgeStyle(status: string) {
  const norm = status.toLowerCase();
  if (norm.includes("part") || norm.includes("hold")) {
    return {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      label: status,
    };
  }
  if (norm.includes("repair") || norm.includes("progress")) {
    return {
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-600",
      label: status,
    };
  }
  if (norm.includes("diag") || norm.includes("receiv")) {
    return {
      bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dot: "bg-indigo-600",
      label: status,
    };
  }
  if (norm.includes("ready") || norm.includes("collect") || norm.includes("approv")) {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: status,
    };
  }
  return {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    label: status,
  };
}

export function TechnicianJobDetailModal({
  jobIdentifier,
  initialJobSummary,
  onClose,
}: TechnicianJobDetailModalProps) {
  const [job, setJob] = useState<RepairJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!jobIdentifier) return;
    let isMounted = true;

    const run = async () => {
      try {
        const response = await fetchAssignedTechnicianJobDetail(jobIdentifier);
        if (isMounted) {
          setJob(response.job);
          setForbiddenError(null);
          setGenericError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 403) {
          setForbiddenError(
            err.message || "You do not have permission to access this job.",
          );
        } else if (err instanceof ApiError && err.status === 404) {
          setGenericError("Repair job was not found in the system.");
        } else {
          setGenericError(
            err instanceof Error
              ? err.message
              : "Failed to load repair job technical details.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [jobIdentifier, reloadTrigger]);

  if (!jobIdentifier) return null;

  const displayRef = job?.reference || initialJobSummary?.reference || jobIdentifier;
  const displayStatus = job?.status || initialJobSummary?.status || "Unknown";
  const badgeStyle = getStatusBadgeStyle(displayStatus);


  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.25)]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black tracking-wider text-slate-900">
                  {displayRef}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle.bg}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                  {badgeStyle.label}
                </span>
              </div>
              <p className="text-[12px] font-semibold text-slate-500">
                Technical Detail & Bench Specifications
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700"
            aria-label="Close detail modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(85vh-130px)] overflow-y-auto p-6 space-y-6">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-3 text-sm font-bold text-slate-700">
                Fetching technical job specifications...
              </p>
              <p className="text-xs text-slate-400">Verifying bench assignment permission</p>
            </div>
          )}

          {/* 403 Forbidden State (Acceptance Criteria 5) */}
          {!isLoading && forbiddenError && (
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/80 p-6 text-rose-950">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-200 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-rose-900">
                      HTTP 403 Forbidden
                    </span>
                    <h3 className="text-base font-black text-rose-900">
                      Access Denied — Unauthorized Job
                    </h3>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-rose-800">
                    {forbiddenError}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-rose-700">
                    Security Policy: This job card is either assigned to a different technician
                    bench or remains in unassigned triage. You cannot view technical specifications
                    or customer details for jobs outside your assigned queue.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  Return to Active Queue
                </button>
              </div>
            </div>
          )}

          {/* Generic Error State */}
          {!isLoading && !forbiddenError && genericError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Unable to load job</h4>
                  <p className="mt-1 text-xs text-amber-700">{genericError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setReloadTrigger((n) => n + 1);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Successful Job Details (Acceptance Criteria 3) */}
          {!isLoading && !forbiddenError && job && (
            <>
              {/* Device Overview Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <DeviceIconRenderer deviceType={job.deviceType} className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-lg font-black tracking-tight text-slate-950">
                        {job.makeModel}
                      </h4>
                      <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                        {job.deviceType}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Hash className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-500">Serial Number:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {job.serialNumber?.trim() || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-500">Received:</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(job.receivedAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reported Fault Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                  Reported Technical Fault Description
                </p>
                <div className="mt-2.5 whitespace-pre-wrap rounded-xl border border-slate-200/70 bg-white p-4 font-mono text-xs leading-relaxed text-slate-800 shadow-sm">
                  {job.reportedFault}
                </div>
              </div>

              {/* Customer Snapshot Details (Acceptance Criteria 3) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                  Customer Snapshot Details
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <User className="h-4 w-4 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Full Name</p>
                      <p className="truncate text-xs font-bold text-slate-900">
                        {job.customer?.fullName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <Phone className="h-4 w-4 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Contact Number</p>
                      <p className="truncate text-xs font-bold text-slate-900">
                        {job.customer?.contactNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <Mail className="h-4 w-4 shrink-0 text-indigo-600" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                      <p className="truncate text-xs font-bold text-slate-900">
                        {job.customer?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bench Station Audit Notice */}
              <div className="flex items-center justify-between rounded-xl bg-slate-100/80 px-4 py-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Verified technician ownership • Active bench session</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-500">
                  ID: {job.id.slice(-6)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
