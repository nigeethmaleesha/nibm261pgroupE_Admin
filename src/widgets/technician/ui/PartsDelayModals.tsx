"use client";

import { useState } from "react";
import {
  AlertCircle,
  Eye,
  LockKeyhole,
  PackageCheck,
  PackageX,
  RefreshCw,
  X,
} from "lucide-react";
import type { RepairJobPartsHold } from "@/src/shared/types/technicianJobs";

const REQUIRED_PART_MAX = 160;
const PUBLIC_REASON_MAX = 500;
const INTERNAL_NOTE_MAX = 250;
const RESOLUTION_NOTE_MAX = 500;

type PlacePartsHoldModalProps = {
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    requiredPart: string;
    publicReason: string;
    internalNote?: string;
  }) => Promise<void> | void;
};

type ResolvePartsDelayModalProps = {
  partsHold: RepairJobPartsHold;
  currentStatus: string;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: { resolutionNote?: string }) => Promise<void> | void;
};

function ModalFrame({
  title,
  subtitle,
  icon,
  children,
  onClose,
  closeDisabled = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={closeDisabled ? undefined : onClose}
        className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">{title}</h3>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function PlacePartsHoldModal({
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: PlacePartsHoldModalProps) {
  const [requiredPart, setRequiredPart] = useState("");
  const [publicReason, setPublicReason] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const trimmedPart = requiredPart.trim();
  const trimmedPublicReason = publicReason.trim();
  const canSubmit =
    !isSubmitting && trimmedPart.length > 0 && trimmedPublicReason.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    await onSubmit({
      requiredPart: trimmedPart,
      publicReason: trimmedPublicReason,
      internalNote: internalNote.trim() || undefined,
    });
  };

  return (
    <ModalFrame
      title="Place on Parts Hold"
      subtitle="Record the required part and a customer-safe reason before pausing repair work."
      icon={<PackageX className="h-5 w-5" />}
      onClose={onClose}
      closeDisabled={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <label className="block">
          <span className="text-xs font-black text-slate-800">
            Required part / component <span className="text-rose-600">*</span>
          </span>
          <input
            value={requiredPart}
            onChange={(event) => setRequiredPart(event.target.value)}
            maxLength={REQUIRED_PART_MAX}
            required
            autoFocus
            placeholder="e.g. USB-C charging port assembly"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <span className="mt-1 block text-right text-[11px] font-semibold text-slate-400">
            {requiredPart.length}/{REQUIRED_PART_MAX}
          </span>
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-black text-slate-800">
            <Eye className="h-3.5 w-3.5 text-emerald-600" />
            Customer-safe delay reason <span className="text-rose-600">*</span>
          </span>
          <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
            This text may be shown to the customer. Do not include internal workshop notes.
          </span>
          <textarea
            value={publicReason}
            onChange={(event) => setPublicReason(event.target.value)}
            maxLength={PUBLIC_REASON_MAX}
            rows={3}
            required
            placeholder="e.g. We are waiting for a replacement charging port before repair can continue."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <span className="block text-right text-[11px] font-semibold text-slate-400">
            {publicReason.length}/{PUBLIC_REASON_MAX}
          </span>
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-black text-slate-800">
            <LockKeyhole className="h-3.5 w-3.5 text-slate-500" />
            Internal note <span className="font-semibold text-slate-400">(optional)</span>
          </span>
          <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
            Workshop-only details. This field is never returned by the customer progress API.
          </span>
          <textarea
            value={internalNote}
            onChange={(event) => setInternalNote(event.target.value)}
            maxLength={INTERNAL_NOTE_MAX}
            rows={2}
            placeholder="e.g. Supplier ETA 2–3 business days; order ref RF-8821"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
          <span className="block text-right text-[11px] font-semibold text-slate-400">
            {internalNote.length}/{INTERNAL_NOTE_MAX}
          </span>
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <PackageX className="h-4 w-4" />
            )}
            {isSubmitting ? "Placing hold..." : "Place on Parts Hold"}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

export function ResolvePartsDelayModal({
  partsHold,
  currentStatus,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ResolvePartsDelayModalProps) {
  const [resolutionNote, setResolutionNote] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    await onSubmit({ resolutionNote: resolutionNote.trim() || undefined });
  };

  return (
    <ModalFrame
      title="Resolve Parts Delay"
      subtitle="Confirm that the required part has arrived. Resolving the hold does not automatically resume repair."
      icon={<PackageCheck className="h-5 w-5" />}
      onClose={onClose}
      closeDisabled={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs leading-5 text-rose-950">
          <p className="font-black">Current parts hold</p>
          <dl className="mt-2 space-y-1.5">
            <div className="grid grid-cols-[105px_1fr] gap-2">
              <dt className="font-bold text-rose-700">Required part</dt>
              <dd className="font-semibold">{partsHold.requiredPart || "Not recorded"}</dd>
            </div>
            <div className="grid grid-cols-[105px_1fr] gap-2">
              <dt className="font-bold text-rose-700">Delay reason</dt>
              <dd className="font-semibold">{partsHold.reason || "Waiting for parts."}</dd>
            </div>
            <div className="grid grid-cols-[105px_1fr] gap-2">
              <dt className="font-bold text-rose-700">Job status</dt>
              <dd className="font-semibold">{currentStatus}</dd>
            </div>
          </dl>
        </div>

        {currentStatus === "Awaiting Approval" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
            The parts hold will be cleared, but this job will remain Awaiting Approval until the customer decides on the current estimate.
          </div>
        )}

        {currentStatus === "Waiting for Parts" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold leading-5 text-blue-900">
            After resolving the hold, use <strong>Resume Work</strong> to explicitly move the job back to In Repair.
          </div>
        )}

        <label className="block">
          <span className="text-xs font-black text-slate-800">
            Resolution note <span className="font-semibold text-slate-400">(optional)</span>
          </span>
          <textarea
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            maxLength={RESOLUTION_NOTE_MAX}
            rows={3}
            autoFocus
            placeholder="e.g. Replacement part received and matched against the order."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <span className="block text-right text-[11px] font-semibold text-slate-400">
            {resolutionNote.length}/{RESOLUTION_NOTE_MAX}
          </span>
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <PackageCheck className="h-4 w-4" />
            )}
            {isSubmitting ? "Resolving..." : "Confirm Parts Received"}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
