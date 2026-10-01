"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  PackageCheck,
  PackageX,
  Play,
  RefreshCw,
  RotateCw,
  Wrench,
} from "lucide-react";
import {
  fetchTechnicianJobProgressHistory,
  resolveTechnicianPartsHold,
  startOrResumeTechnicianRepair,
} from "@/src/shared/api/technicianJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type { TechnicianJobProgressHistoryResponse } from "@/src/shared/types/technicianJobs";
import { useToast } from "@/src/shared/ui/ToastProvider";

type RepairWorkActionsProps = {
  jobIdentifier: string;
  onJobChanged?: () => void;
};

// Start/resume repair is only offered from these statuses; anywhere else the
// action is not applicable and the widget renders nothing.
const START_STATUSES = ["Approved", "Waiting for Parts"];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RepairWorkActions({ jobIdentifier, onJobChanged }: RepairWorkActionsProps) {
  const toast = useToast();
  const [context, setContext] = useState<TechnicianJobProgressHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isResolvingHold, setIsResolvingHold] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!jobIdentifier) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchTechnicianJobProgressHistory(jobIdentifier);
      setContext(response);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Unable to load repair work status.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobIdentifier]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStartOrResume = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const response = await startOrResumeTechnicianRepair(jobIdentifier, {
        expectedRevision: context?.job.revision,
        // Only sent when an approved version is known; the backend rejects a
        // superseded version with 409 ESTIMATE_SUPERSEDED.
        estimateVersionNumber: context?.workAuthorisation.approvedVersionNumber ?? undefined,
      });
      toast.success(response.message || "Repair work updated.");
      await load();
      onJobChanged?.();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to start or resume repair.";
      // A 409 means the job or estimate changed (superseded, locked, hold,
      // stale revision): reload so the screen shows the current state. Reload
      // first, because load() clears the error banner.
      if (err instanceof ApiError && err.status === 409) {
        await load();
        onJobChanged?.();
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleResolvePartsHold = async () => {
    setIsResolvingHold(true);
    setError(null);
    try {
      const response = await resolveTechnicianPartsHold(jobIdentifier, {
        expectedRevision: context?.job.revision,
      });
      toast.success(response.message || "Parts hold resolved.");
      await load();
      onJobChanged?.();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to resolve the parts hold.";
      setError(message);
      toast.error(message);
    } finally {
      setIsResolvingHold(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          Loading repair work status...
        </div>
      </section>
    );
  }

  const job = context?.job;
  if (!job) return null;

  const status = job.status;
  const isResuming = status === "Waiting for Parts";
  const partsHoldActive = Boolean(job.partsHold.active);
  const canShowStartAction = START_STATUSES.includes(status);
  const canStartRepair = Boolean(context?.canStartRepair);
  const blockedReasons = context?.startBlockedReasons || [];
  // Once the hold itself is resolved, any remaining reasons are unrelated to it.
  const nonHoldBlockedReasons = blockedReasons.filter(
    (reason) => !reason.toLowerCase().includes("parts hold"),
  );

  if (!canShowStartAction && status !== "In Repair") {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950">Repair Work</h2>
            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500">
              Start repair once the estimate is approved, or resume after a parts hold clears.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status === "In Repair" && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold leading-5 text-blue-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-black">Repair is in progress</p>
              <p className="mt-0.5 text-blue-800">
                {job.repairWork.lastAction === "RESUME" ? "Resumed" : "Started"} on{" "}
                {formatDate(job.repairWork.lastStartedAt)}
                {job.repairWork.approvedEstimateVersion
                  ? ` under approved estimate version ${job.repairWork.approvedEstimateVersion}.`
                  : "."}
              </p>
            </div>
          </div>
        )}

        {canShowStartAction && (
          <div className="space-y-4">
            {partsHoldActive && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <PackageX className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <div>
                      <h3 className="text-sm font-black text-rose-950">Parts hold active</h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-rose-800">
                        {job.partsHold.reason || "Waiting for parts."} Resolve the hold once parts
                        have arrived to unlock Resume Work.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResolvePartsHold}
                    disabled={isResolvingHold}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResolvingHold ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <PackageCheck className="h-4 w-4" />
                    )}
                    {isResolvingHold ? "Resolving..." : "Parts Received / Resolve Hold"}
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-indigo-950">
                    {isResuming ? "Ready to resume repair" : "Ready to start repair"}
                  </h3>
                  <p className="mt-1 text-xs font-medium leading-5 text-indigo-800/80">
                    {isResuming
                      ? "Resuming moves this job from Waiting for Parts back to In Repair."
                      : "Starting moves this job from Approved to In Repair under the approved estimate scope."}
                  </p>
                  {!canStartRepair && nonHoldBlockedReasons.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-xs font-semibold text-amber-800">
                      {nonHoldBlockedReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStartOrResume}
                  disabled={isStarting || !canStartRepair}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStarting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : isResuming ? (
                    <RotateCw className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isStarting ? "Saving..." : isResuming ? "Resume Work" : "Start Repair"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
