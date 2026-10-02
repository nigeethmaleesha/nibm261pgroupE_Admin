"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, LoaderCircle, RotateCcw, X } from "lucide-react";
import { markJobReadyForReturn } from "@/src/shared/api/repairJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type { RepairJob } from "@/src/shared/types/repairJobs";

const REASON_OPTIONS = [
  "Customer declined estimate",
  "Device unrepairable during diagnosis",
  "Required replacement parts unavailable",
  "Customer requested device return",
  "Other",
] as const;

interface ReadyForReturnModalProps {
  open: boolean;
  job: RepairJob;
  onClose: () => void;
  onSuccess: (job: RepairJob, message: string) => void;
}

export function ReadyForReturnModal({
  open,
  job,
  onClose,
  onSuccess,
}: ReadyForReturnModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate mandatory return reason selection/text
    if (!selectedReason) {
      setError("Please select a return reason.");
      return;
    }

    const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason;
    if (!finalReason) {
      setError("Please enter a custom return reason.");
      return;
    }

    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
      setError("Please provide return notes / customer explanation.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await markJobReadyForReturn(job.reference || job.id, {
        returnReason: finalReason,
        notes: trimmedNotes,
        expectedRevision: job.revision,
      });

      onSuccess(
        response.job,
        response.message || "Job marked Ready for Return (unrepaired). Customer notified.",
      );
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to mark device ready for return. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close ready for return dialog"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={submitting ? undefined : onClose}
      />

      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-600">
                SCRUM-26 / SCRUM-115
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                Mark Ready for Return (Unrepaired)
              </h2>
              <p className="mt-0.5 font-mono text-xs font-bold text-slate-500">
                {job.reference} · {job.makeModel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Warning Banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="font-extrabold text-amber-950">
                This will prepare the device for unrepaired pickup:
              </p>
              <ul className="list-disc pl-4 text-[11px] font-medium text-amber-800 space-y-0.5">
                <li>Releases any active parts hold and closes draft revisions.</li>
                <li>Changes job status to <strong>Ready for Return</strong>.</li>
                <li>Sends a customer notification email with pickup instructions.</li>
              </ul>
            </div>
          </div>

          {/* Mandatory Return Reason Selection */}
          <div>
            <label className="block text-[12px] font-black text-slate-800">
              Return Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError("");
              }}
              disabled={submitting}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-100"
            >
              <option value="">Select mandatory return reason...</option>
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason if Other */}
          {selectedReason === "Other" && (
            <div>
              <label className="block text-[12px] font-black text-slate-800">
                Specify Custom Reason <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g., Customer requested early return before repair"
                maxLength={200}
                disabled={submitting}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-100"
              />
            </div>
          )}

          {/* Mandatory Return Notes / Details */}
          <div>
            <label className="block text-[12px] font-black text-slate-800">
              Return Notes & Pickup Details <span className="text-rose-500">*</span>
            </label>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              Included in customer notification and saved in the audit log.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Device reassembled to original intake condition. Battery charges to 100%. Ready for pickup at main desk."
              rows={3}
              maxLength={2000}
              disabled={submitting}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] font-medium text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 rounded-xl px-4 text-xs font-black text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !selectedReason}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Confirm Return Readiness
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
