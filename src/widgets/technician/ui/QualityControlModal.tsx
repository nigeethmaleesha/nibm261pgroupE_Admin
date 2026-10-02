"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileCheck2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import type { CompleteRepairPayload } from "@/src/shared/types/technicianJobs";

const MAX_NOTES_LEN = 2000;

type QualityControlModalProps = {
  jobReference: string;
  reportedFault?: string;
  makeModel?: string;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: CompleteRepairPayload) => Promise<void> | void;
};

export function QualityControlModal({
  jobReference,
  reportedFault,
  makeModel,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: QualityControlModalProps) {
  const [faultResolved, setFaultResolved] = useState(false);
  const [functionalTestPassed, setFunctionalTestPassed] = useState(false);
  const [functionalTestNotes, setFunctionalTestNotes] = useState("");
  const [customerSummary, setCustomerSummary] = useState(
    "Repair completed and passed quality control testing. Your device is ready for collection!",
  );
  const [internalNotes, setInternalNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit =
    faultResolved &&
    functionalTestPassed &&
    functionalTestNotes.trim().length > 0 &&
    customerSummary.trim().length > 0 &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faultResolved) {
      setLocalError("You must confirm that the reported fault has been resolved.");
      return;
    }
    if (!functionalTestPassed) {
      setLocalError("You must confirm that functional testing has passed.");
      return;
    }
    if (!functionalTestNotes.trim()) {
      setLocalError("Functional test notes are required.");
      return;
    }
    if (!customerSummary.trim()) {
      setLocalError("A customer-safe completion summary is required.");
      return;
    }

    setLocalError(null);
    await onSubmit({
      faultResolved: true,
      functionalTestPassed: true,
      functionalTestNotes: functionalTestNotes.trim(),
      customerSummary: customerSummary.trim(),
      internalNotes: internalNotes.trim() || undefined,
    });
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={isSubmitting ? undefined : onClose}
        className="fixed inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quality Control Checklist"
        className="relative z-10 my-8 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-emerald-50/70 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-950">Quality Control Checklist</h3>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  SCRUM-111
                </span>
              </div>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                Verify testing criteria before marking the device Ready for Collection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {displayError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Job Reference & Reported Fault Callout */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span>Job Reference: <strong className="text-slate-900">{jobReference}</strong></span>
              {makeModel && <span className="text-slate-700">{makeModel}</span>}
            </div>
            {reportedFault && (
              <div className="mt-2 pt-2 border-t border-slate-200/80">
                <span className="text-amber-800 font-bold">Reported Fault:</span>
                <p className="text-slate-700 mt-0.5">{reportedFault}</p>
              </div>
            )}
          </div>

          {/* Checklist Verification Flags */}
          <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Required QC Verification
            </h4>

            {/* Checkbox 1: Fault Resolved */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={faultResolved}
                onChange={(e) => {
                  setFaultResolved(e.target.checked);
                  setLocalError(null);
                }}
                disabled={isSubmitting}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  Confirm Reported Fault is Resolved <span className="text-rose-500">*</span>
                </p>
                <p className="text-slate-500 leading-relaxed">
                  The primary issue reported by customer has been completely diagnosed, repaired, and re-tested.
                </p>
              </div>
            </label>

            {/* Checkbox 2: Functional Testing Passed */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={functionalTestPassed}
                onChange={(e) => {
                  setFunctionalTestPassed(e.target.checked);
                  setLocalError(null);
                }}
                disabled={isSubmitting}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  Full Functional Testing Completed & Passed <span className="text-rose-500">*</span>
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Hardware diagnostics, inputs/outputs, battery/power and system stability tests passed without issues.
                </p>
              </div>
            </label>
          </div>

          {/* Field 1: Functional Test Notes */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <label htmlFor="functionalTestNotes" className="flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                Functional Test Notes & Results <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-normal text-slate-400">
                {functionalTestNotes.length}/{MAX_NOTES_LEN}
              </span>
            </div>
            <textarea
              id="functionalTestNotes"
              rows={3}
              value={functionalTestNotes}
              onChange={(e) => {
                setFunctionalTestNotes(e.target.value.slice(0, MAX_NOTES_LEN));
                setLocalError(null);
              }}
              placeholder="Detail tests performed (e.g. Display touch grid tested, power cycling passed, audio/mic checked OK)..."
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
            />
          </div>

          {/* Field 2: Customer Public Summary */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <label htmlFor="customerSummary" className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-blue-600" />
                Customer Completion Message (Visible on Public Tracking) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-normal text-slate-400">
                {customerSummary.length}/{MAX_NOTES_LEN}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              This message will be shown on the customer tracking portal and in the ready-for-collection notification.
            </p>
            <textarea
              id="customerSummary"
              rows={2}
              value={customerSummary}
              onChange={(e) => {
                setCustomerSummary(e.target.value.slice(0, MAX_NOTES_LEN));
                setLocalError(null);
              }}
              placeholder="Message to the customer regarding repair completion..."
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
            />
          </div>

          {/* Field 3: Internal Notes (Optional) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <label htmlFor="internalNotes" className="flex items-center gap-1.5 text-slate-700">
                <LockKeyhole className="h-3.5 w-3.5 text-amber-600" />
                Internal Bench Notes <span className="text-[11px] font-normal text-slate-400">(Optional - Staff Only)</span>
              </label>
              <span className="text-[11px] font-normal text-slate-400">
                {internalNotes.length}/{MAX_NOTES_LEN}
              </span>
            </div>
            <textarea
              id="internalNotes"
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value.slice(0, MAX_NOTES_LEN))}
              placeholder="Optional technician notes for internal records..."
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving & Finalizing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Ready for Collection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
