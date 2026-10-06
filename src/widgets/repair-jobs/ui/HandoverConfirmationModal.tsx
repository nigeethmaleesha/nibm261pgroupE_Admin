"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  LoaderCircle,
  PackageCheck,
  RotateCcw,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";
import { recordDeviceHandover } from "@/src/shared/api/repairJobs.api";
import { ApiError } from "@/src/shared/api/http";
import { useToast } from "@/src/shared/ui/ToastProvider";
import type { RepairJob } from "@/src/shared/types/repairJobs";

interface HandoverConfirmationModalProps {
  open: boolean;
  job: RepairJob;
  onClose: () => void;
  onSuccess: (job: RepairJob, message: string) => void;
}

export function HandoverConfirmationModal({
  open,
  job,
  onClose,
  onSuccess,
}: HandoverConfirmationModalProps) {
  const toast = useToast();
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [deviceHandedOver, setDeviceHandedOver] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const isRepaired = job.status === "Ready for Collection";
  const outcomeText = isRepaired ? "Repaired" : "Unrepaired";

  const handleClose = () => {
    if (submitting) return;
    setError("");
    setIdentityConfirmed(false);
    setDeviceHandedOver(false);
    setNotes("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identityConfirmed) {
      setError("You must verify the customer's identity (e.g. Photo ID, NIC, or Driving License).");
      return;
    }

    if (!deviceHandedOver) {
      setError("You must confirm that the physical device has been handed over to the customer.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await recordDeviceHandover(job.reference || job.id, {
        customerIdentityConfirmed: identityConfirmed,
        deviceHandedOver: deviceHandedOver,
        notes: notes.trim() || undefined,
        expectedRevision: job.revision,
      });

      if (response.alreadyCollected) {
        toast.info(response.message || "Device handover was already recorded for this repair job.");
      } else {
        toast.success(
          response.message ||
            `Device successfully handed over to customer (${outcomeText}). Job is now Collected.`,
        );
      }

      onSuccess(
        response.job,
        response.message || `Device handed over (${outcomeText}). Job status is now Collected.`,
      );
      handleClose();
    } catch (err) {
      let message = "Failed to record device handover. Please try again.";
      if (err instanceof ApiError) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close handover confirmation dialog"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px] transition-opacity"
        onClick={handleClose}
      />

      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${
                isRepaired
                  ? "bg-emerald-600 shadow-[0_6px_18px_rgba(16,185,129,0.25)]"
                  : "bg-amber-600 shadow-[0_6px_18px_rgba(217,119,6,0.25)]"
              }`}
            >
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <p
                className={`text-[10px] font-black uppercase tracking-[0.14em] ${
                  isRepaired ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                SCRUM-120 · Final Handover
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                Confirm Device Handover
              </h2>
              <p className="mt-0.5 font-mono text-xs font-bold text-slate-500">
                Ref: {job.reference} · {job.makeModel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Outcome Context Banner */}
          <div
            className={`rounded-2xl border p-4 text-xs ${
              isRepaired
                ? "border-emerald-200 bg-emerald-50/85 text-emerald-950"
                : "border-amber-200 bg-amber-50/85 text-amber-950"
            }`}
          >
            <div className="flex items-center gap-2">
              {isRepaired ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <RotateCcw className="h-4 w-4 shrink-0 text-amber-600" />
              )}
              <h3 className="text-[12px] font-black uppercase tracking-wider">
                Handover Outcome: {outcomeText}
              </h3>
            </div>
            <p className="mt-1.5 text-[11px] font-medium leading-relaxed">
              {isRepaired
                ? "The device repair is complete and passed quality verification. Handing over will record a permanent REPAIRED outcome, transition the job to Collected, and lock it as read-only."
                : "The device was not repaired and was prepared for customer return. Handing over will record a permanent UNREPAIRED return outcome, transition the job to Collected, and lock it as read-only."}
            </p>
          </div>

          {/* Customer & Device Information Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </p>
                <p className="mt-0.5 font-bold text-slate-900">{job.customer.fullName}</p>
                <p className="text-[11px] text-slate-500">{job.customer.contactNumber}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Device
                </p>
                <p className="mt-0.5 font-bold text-slate-900">{job.makeModel}</p>
                <p className="text-[11px] font-mono text-slate-500">
                  SN: {job.serialNumber || "Not recorded"}
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Checkbox 1: Customer Identity Verification */}
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
              identityConfirmed
                ? "border-emerald-300 bg-emerald-50/60 shadow-xs"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={identityConfirmed}
              onChange={(e) => {
                setIdentityConfirmed(e.target.checked);
                if (error) setError("");
              }}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
            />
            <div className="space-y-0.5">
              <span className="text-[12px] font-extrabold text-slate-900">
                I have verified the customer&apos;s identity{" "}
                <span className="text-rose-500">*</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500">
                Staff member verified customer Photo ID, National Identity Card (NIC), or Driving License.
              </p>
            </div>
          </label>

          {/* Mandatory Checkbox 2: Device Handover Confirmation */}
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
              deviceHandedOver
                ? "border-emerald-300 bg-emerald-50/60 shadow-xs"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={deviceHandedOver}
              onChange={(e) => {
                setDeviceHandedOver(e.target.checked);
                if (error) setError("");
              }}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
            />
            <div className="space-y-0.5">
              <span className="text-[12px] font-extrabold text-slate-900">
                I confirm the device has been physically handed over{" "}
                <span className="text-rose-500">*</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500">
                Device, any accessories, and documentation were physically delivered to the customer.
              </p>
            </div>
          </label>

          {/* Optional Handover Notes */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-black text-slate-800">
                Handover Notes (Optional)
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {notes.length}/500
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="e.g. Customer presented NIC/Driving License. Settled final invoice. Screen protector and charger handed over."
              disabled={submitting}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="h-10 rounded-xl px-4 text-xs font-black text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!identityConfirmed || !deviceHandedOver || submitting}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300 ${
                isRepaired
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Processing Handover...
                </>
              ) : (
                <>
                  <PackageCheck className="h-4 w-4" />
                  Confirm Handover ({outcomeText})
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
