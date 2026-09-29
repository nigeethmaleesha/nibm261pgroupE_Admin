"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertOctagon,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Cpu,
  Laptop,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Tablet,
  User,
  Wrench,
} from "lucide-react";
import { fetchAssignedTechnicianJobDetail } from "@/src/shared/api/technicianJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type { RepairJob } from "@/src/shared/types/repairJobs";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";

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

export function TechnicianJobDetailPage() {
  const params = useParams();
  const jobIdentifier = String(params?.jobIdentifier || "");

  const [job, setJob] = useState<RepairJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          setError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 403) {
          // Acceptance Criteria 5: Handle 403 Forbidden with clear Access Denied notification
          setForbiddenError(
            err.message || "You do not have permission to access this job.",
          );
        } else if (err instanceof ApiError && err.status === 404) {
          setError("Repair job was not found in the system.");
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load repair job specifications.",
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

  return (
    <InternalDashboardShell>
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Active Queue
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-sm font-bold text-slate-800">
              Verifying bench ownership and loading technical specifications...
            </p>
          </div>
        )}

        {/* 403 Forbidden State (Acceptance Criteria 5) */}
        {!isLoading && forbiddenError && (
          <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/90 p-8 text-rose-950 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-rose-200 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-rose-900">
                    HTTP 403 Forbidden
                  </span>
                  <h2 className="text-xl font-black text-rose-900">
                    Access Denied — Job Assignment Restricted
                  </h2>
                </div>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-rose-800">
                  {forbiddenError}
                </p>
                <div className="mt-4 rounded-2xl border border-rose-200 bg-white/70 p-4 text-xs leading-relaxed text-rose-800">
                  <strong>Strict Security Notice:</strong> Under the workshop role-based access
                  control policy, technicians are strictly forbidden from viewing technical
                  parameters or customer privacy details for jobs not assigned to their active bench.
                </div>
                <div className="mt-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-rose-700"
                  >
                    Return to My Assigned Queue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generic Error */}
        {!isLoading && !forbiddenError && error && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">Unable to retrieve job</h3>
                <p className="mt-1 text-xs text-amber-700">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setReloadTrigger((n) => n + 1);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
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
          <div className="space-y-6">
            {/* Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black tracking-wider text-slate-900">
                        {job.reference}
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      Assigned Technical Repair Card
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>
                    Received:{" "}
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

            {/* Device & Fault Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Device Overview */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <DeviceIconRenderer deviceType={job.deviceType} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Device Specifications</h3>
                    <p className="text-xs font-semibold text-slate-500">Hardware metadata</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-500">Device Type</span>
                    <span className="font-bold text-slate-900">{job.deviceType}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-500">Make & Model</span>
                    <span className="font-bold text-slate-900">{job.makeModel}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-500">Serial Number</span>
                    <span className="font-mono font-bold text-slate-900">
                      {job.serialNumber?.trim() || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Snapshot */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Customer Snapshot</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Contact details for repair updates
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-500">Customer Name</span>
                    <span className="font-bold text-slate-900">
                      {job.customer?.fullName || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-500">Contact Number</span>
                    <span className="font-bold text-slate-900">
                      {job.customer?.contactNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-500">Email Address</span>
                    <span className="font-bold text-slate-900">
                      {job.customer?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reported Fault */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-900">Full Reported Fault Description</h3>
              <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50 p-5 font-mono text-xs leading-relaxed text-slate-800">
                {job.reportedFault}
              </div>
            </div>

            {/* Audit validation banner */}
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50/80 border border-emerald-200 px-5 py-3 text-xs text-emerald-900 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Authorized Bench Session • Verified Ownership</span>
              </div>
              <span className="font-mono text-xs text-emerald-800">
                Job ID: {job.id}
              </span>
            </div>
          </div>
        )}
      </div>
    </InternalDashboardShell>
  );
}
