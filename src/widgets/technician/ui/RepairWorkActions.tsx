"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  PackageCheck,
  PackageX,
  PauseCircle,
  Play,
  RefreshCw,
  RotateCw,
  Wrench,
} from "lucide-react";
import {
  fetchTechnicianJobProgressHistory,
  placeTechnicianPartsHold,
  resolveTechnicianPartsHold,
  startOrResumeTechnicianRepair,
} from "@/src/shared/api/technicianJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type { TechnicianJobProgressHistoryResponse } from "@/src/shared/types/technicianJobs";
import { useToast } from "@/src/shared/ui/ToastProvider";
import {
  PlacePartsHoldModal,
  ResolvePartsDelayModal,
} from "./PartsDelayModals";

type RepairWorkActionsProps = {
  jobIdentifier: string;
  onJobChanged?: () => void;
};

// Start/resume repair is only offered from these statuses. An active parts hold
// can also be managed while Awaiting Approval because clearing the hold must not
// alter that approval status.
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
  const [isPlacingHold, setIsPlacingHold] = useState(false);
  const [isResolvingHold, setIsResolvingHold] = useState(false);
  const [showPlaceHoldModal, setShowPlaceHoldModal] = useState(false);
  const [showResolveHoldModal, setShowResolveHoldModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const reloadAfterConflict = async (err: unknown) => {
    if (err instanceof ApiError && err.status === 409) {
      await load();
      onJobChanged?.();
    }
  };

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
      await reloadAfterConflict(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  };

  const handlePlacePartsHold = async (payload: {
    requiredPart: string;
    publicReason: string;
    internalNote?: string;
  }) => {
    setIsPlacingHold(true);
    setModalError(null);
    try {
      const response = await placeTechnicianPartsHold(jobIdentifier, {
        ...payload,
        expectedRevision: context?.job.revision,
      });
      toast.success(response.message || "Parts hold placed successfully.");
      setShowPlaceHoldModal(false);
      await load();
      onJobChanged?.();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to place the parts hold.";
      await reloadAfterConflict(err);
      setModalError(message);
      toast.error(message);
    } finally {
      setIsPlacingHold(false);
    }
  };

  const handleResolvePartsHold = async (payload: { resolutionNote?: string }) => {
    setIsResolvingHold(true);
    setModalError(null);
    try {
      const response = await resolveTechnicianPartsHold(jobIdentifier, {
        ...payload,
        expectedRevision: context?.job.revision,
      });
      toast.success(response.message || "Parts delay resolved.");
      setShowResolveHoldModal(false);
      await load();
      onJobChanged?.();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to resolve the parts hold.";
      await reloadAfterConflict(err);
      setModalError(message);
      toast.error(message);
    } finally {
      setIsResolvingHold(false);
    }
  };

  if (isLoading && !context) {
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

  // This widget is relevant while work is active, start/resume is applicable,
  // or an active hold needs resolving (including while Awaiting Approval).
  if (!canShowStartAction && status !== "In Repair" && !partsHoldActive) {
    return null;
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950">Repair Work</h2>
              <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500">
                Start or resume approved repair work and manage any parts delay without changing unrelated job data.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {status === "In Repair" && !partsHoldActive && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 text-xs font-semibold leading-5 text-blue-900">
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
                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setShowPlaceHoldModal(true);
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-rose-700"
                >
                  <PauseCircle className="h-4 w-4" />
                  Place on Parts Hold
                </button>
              </div>
            </div>
          )}

          {partsHoldActive && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <PackageX className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <h3 className="text-sm font-black text-rose-950">Parts hold active</h3>
                    {job.partsHold.requiredPart && (
                      <p className="mt-1 text-xs font-bold text-rose-900">
                        Required part: {job.partsHold.requiredPart}
                      </p>
                    )}
                    <p className="mt-1 text-xs font-medium leading-5 text-rose-800">
                      {job.partsHold.reason || "Waiting for parts."}
                    </p>
                    {job.partsHold.internalNote && (
                      <p className="mt-2 rounded-lg border border-rose-200/70 bg-white/60 px-3 py-2 text-[11px] font-semibold leading-4 text-rose-800">
                        Internal: {job.partsHold.internalNote}
                      </p>
                    )}
                    {status === "Awaiting Approval" && (
                      <p className="mt-2 text-[11px] font-bold leading-4 text-amber-800">
                        The hold can be resolved now; the job will still remain Awaiting Approval.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setShowResolveHoldModal(true);
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-rose-700"
                >
                  <PackageCheck className="h-4 w-4" />
                  Resolve Parts Delay
                </button>
              </div>
            </div>
          )}

          {canShowStartAction && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-indigo-950">
                    {isResuming ? "Ready to resume repair" : "Ready to start repair"}
                  </h3>
                  <p className="mt-1 text-xs font-medium leading-5 text-indigo-800/80">
                    {isResuming
                      ? partsHoldActive
                        ? "Resolve the active parts delay first. Repair returns to In Repair only when you explicitly choose Resume Work."
                        : "The parts delay is cleared. Resume Work explicitly moves this job from Waiting for Parts back to In Repair."
                      : partsHoldActive
                        ? "The latest estimate is approved, but the active parts hold must be resolved before repair can start or resume."
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
          )}
        </div>
      </section>

      {showPlaceHoldModal && (
        <PlacePartsHoldModal
          isSubmitting={isPlacingHold}
          error={modalError}
          onClose={() => {
            if (!isPlacingHold) {
              setModalError(null);
              setShowPlaceHoldModal(false);
            }
          }}
          onSubmit={handlePlacePartsHold}
        />
      )}

      {showResolveHoldModal && (
        <ResolvePartsDelayModal
          partsHold={job.partsHold}
          currentStatus={status}
          isSubmitting={isResolvingHold}
          error={modalError}
          onClose={() => {
            if (!isResolvingHold) {
              setModalError(null);
              setShowResolveHoldModal(false);
            }
          }}
          onSubmit={handleResolvePartsHold}
        />
      )}
    </>
  );
}
