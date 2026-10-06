"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  Eye,
  Lock,
  PencilLine,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import {
  fetchTechnicianWorkNotes,
  recordTechnicianWorkNote,
} from "@/src/shared/api/technicianJobs.api";
import { fetchStaffWorkNotes } from "@/src/shared/api/estimates.api";
import { ApiError } from "@/src/shared/api/http";
import type {
  RepairWorkNoteEntry,
  RepairWorkNotesResponse,
} from "@/src/shared/types/technicianJobs";
import { useToast } from "@/src/shared/ui/ToastProvider";

type RepairWorkNotesProps = {
  jobIdentifier: string;
  // technician: record + history. staff: read-only history.
  mode?: "technician" | "staff";
  // Bump to reload, e.g. after Start Repair changes the job status.
  refreshKey?: number;
};

// Limits match the backend (repairWorkNoteService).
const WORK_NOTE_MAX = 2000;
const PUBLIC_UPDATE_MAX = 1000;
const CORRECTION_REASON_MAX = 500;

function createClientKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `work-note-${crypto.randomUUID()}`;
  }
  return `work-note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RepairWorkNotes({
  jobIdentifier,
  mode = "technician",
  refreshKey = 0,
}: RepairWorkNotesProps) {
  const toast = useToast();
  const isTechnician = mode === "technician";
  const [context, setContext] = useState<RepairWorkNotesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workNote, setWorkNote] = useState("");
  const [publicUpdate, setPublicUpdate] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [correcting, setCorrecting] = useState<RepairWorkNoteEntry | null>(null);
  // One key per submit. It is kept while the same content is retried (e.g.
  // after a network error) so the backend replays instead of duplicating, and
  // dropped as soon as the text changes or the entry is saved.
  const idempotencyKeyRef = useRef<string | null>(null);

  const fetchNotes = useCallback(
    () => (isTechnician ? fetchTechnicianWorkNotes(jobIdentifier) : fetchStaffWorkNotes(jobIdentifier)),
    [jobIdentifier, isTechnician],
  );

  const loadErrorMessage = (err: unknown) =>
    err instanceof ApiError || err instanceof Error ? err.message : "Unable to load work notes.";

  // Manual reload (Refresh button, after save or a 409).
  const load = useCallback(async () => {
    if (!jobIdentifier) return;
    setIsLoading(true);
    setError(null);
    try {
      setContext(await fetchNotes());
    } catch (err) {
      setError(loadErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [jobIdentifier, fetchNotes]);

  // Initial load and reload when the parent bumps refreshKey. State is only
  // set once the request settles, and ignored if the job changed meanwhile.
  useEffect(() => {
    if (!jobIdentifier) return;
    let cancelled = false;
    fetchNotes()
      .then((response) => {
        if (cancelled) return;
        setContext(response);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(loadErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobIdentifier, fetchNotes, refreshKey]);

  const edit = (setter: (value: string) => void) => (value: string) => {
    idempotencyKeyRef.current = null;
    setter(value);
  };

  const resetForm = () => {
    idempotencyKeyRef.current = null;
    setWorkNote("");
    setPublicUpdate("");
    setCorrectionReason("");
    setCorrecting(null);
  };

  const startCorrection = (entry: RepairWorkNoteEntry) => {
    idempotencyKeyRef.current = null;
    setCorrecting(entry);
    setWorkNote(entry.workNote);
    setPublicUpdate(entry.publicUpdate);
    setCorrectionReason("");
    setError(null);
  };

  const trimmedWorkNote = workNote.trim();
  const trimmedPublicUpdate = publicUpdate.trim();
  const trimmedReason = correctionReason.trim();
  const canSubmit =
    Boolean(context?.canRecord) &&
    !isSaving &&
    trimmedWorkNote.length > 0 &&
    trimmedPublicUpdate.length > 0 &&
    (!correcting || trimmedReason.length > 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    setError(null);
    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = createClientKey();
    try {
      const response = await recordTechnicianWorkNote(
        jobIdentifier,
        {
          workNote: trimmedWorkNote,
          publicUpdate: trimmedPublicUpdate,
          // The backend rejects a stale version with 409 ESTIMATE_SUPERSEDED.
          estimateVersionNumber: context?.approvedVersionNumber ?? undefined,
          ...(correcting
            ? { correctionOf: correcting.id, correctionReason: trimmedReason }
            : {}),
        },
        idempotencyKeyRef.current,
      );
      toast.success(response.message || "Work progress recorded.");
      resetForm();
      await load();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to record work progress.";
      // 409: approval, hold or status changed. Reload first (load() clears
      // the error banner), then show why it was rejected. The typed text is
      // kept so the technician does not lose it.
      if (err instanceof ApiError && err.status === 409) {
        idempotencyKeyRef.current = null;
        await load();
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !context) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          Loading work notes...
        </div>
      </section>
    );
  }

  const entries = context?.entries || [];
  const blockedReasons = context?.recordBlockedReasons || [];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950">Work Progress</h2>
              <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500">
                {isTechnician
                  ? "Record the work performed (internal) and a customer-safe update while the job is In Repair."
                  : "Work performed and customer updates recorded by the assigned technician."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isTechnician && !context?.canRecord && blockedReasons.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-semibold leading-5 text-amber-950">
            <p className="font-black">Work progress cannot be recorded right now.</p>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5">
              {blockedReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {isTechnician && context?.canRecord && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-emerald-950">
                {correcting ? "Correct an earlier entry" : "New work progress entry"}
              </h3>
              {context.approvedVersionNumber && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                  Approved Version {context.approvedVersionNumber}
                </span>
              )}
            </div>

            {correcting && (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs font-semibold text-violet-900">
                <span>
                  Correcting the entry from {formatDate(correcting.recordedAt)}. The original stays in
                  the history; the customer will see the corrected update instead.
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex shrink-0 items-center gap-1 font-black text-violet-700 hover:text-violet-900"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            )}

            <label className="block">
              <span className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                Work note (internal) <span className="text-rose-600">*</span>
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                Technical details for the shop only. Never shown to the customer.
              </span>
              <textarea
                value={workNote}
                onChange={(e) => edit(setWorkNote)(e.target.value)}
                maxLength={WORK_NOTE_MAX}
                rows={4}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. Replaced charging port, tested 19V rail under load"
              />
              <span className="block text-right text-[11px] font-semibold text-slate-400">
                {workNote.length}/{WORK_NOTE_MAX}
              </span>
            </label>

            <label className="block">
              <span className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                Customer update (visible to customer) <span className="text-rose-600">*</span>
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                Plain, customer-safe wording. The customer sees this text.
              </span>
              <textarea
                value={publicUpdate}
                onChange={(e) => edit(setPublicUpdate)(e.target.value)}
                maxLength={PUBLIC_UPDATE_MAX}
                rows={3}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. The charging port has been replaced and we are testing it now."
              />
              <span className="block text-right text-[11px] font-semibold text-slate-400">
                {publicUpdate.length}/{PUBLIC_UPDATE_MAX}
              </span>
            </label>

            {correcting && (
              <label className="block">
                <span className="text-xs font-black text-slate-800">
                  Reason for correction <span className="text-rose-600">*</span>
                </span>
                <input
                  value={correctionReason}
                  onChange={(e) => edit(setCorrectionReason)(e.target.value)}
                  maxLength={CORRECTION_REASON_MAX}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  placeholder="e.g. Wrong voltage recorded"
                />
              </label>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSaving ? "Saving..." : correcting ? "Save Correction" : "Save Progress"}
              </button>
            </div>
          </form>
        )}

        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            History ({entries.length})
          </h3>
          {entries.length === 0 ? (
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold italic text-slate-500">
              No work progress has been recorded yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className={`rounded-2xl border p-4 text-xs shadow-sm ${
                    entry.isCurrent ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-75"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900">
                        {entry.recordedBy.fullName || "Technician"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">
                        Version {entry.estimateVersionNumber}
                      </span>
                      {entry.isCorrection && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">
                          Correction
                        </span>
                      )}
                      {!entry.isCurrent && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                          Corrected
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {formatDate(entry.recordedAt)}
                    </span>
                  </div>

                  {entry.isCorrection && entry.correctionReason && (
                    <p className="mt-2 text-[11px] font-bold text-violet-700">
                      Reason: <span className="font-medium text-slate-600">{entry.correctionReason}</span>
                    </p>
                  )}

                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <Lock className="h-3 w-3" /> Internal work note
                    </p>
                    <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-800">{entry.workNote}</p>
                  </div>
                  <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                      <Eye className="h-3 w-3" /> Customer update
                    </p>
                    <p className="whitespace-pre-wrap font-medium leading-relaxed text-emerald-950">{entry.publicUpdate}</p>
                  </div>

                  {isTechnician && entry.isCurrent && context?.canRecord && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => startCorrection(entry)}
                        className="inline-flex items-center gap-1 text-[11px] font-black text-violet-700 hover:text-violet-900"
                      >
                        <PencilLine className="h-3.5 w-3.5" /> Correct this entry
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
