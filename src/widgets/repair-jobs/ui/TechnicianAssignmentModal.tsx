"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, LoaderCircle, UserRoundCheck, X } from "lucide-react";
import { assignRepairJob } from "@/src/shared/api/repairJobs.api";
import { getTechnicians } from "@/src/shared/api/technicians.api";
import { ApiError } from "@/src/shared/api/http";
import type { InternalUser } from "@/src/shared/types/internal";
import type { RepairJob, RepairJobTechnician } from "@/src/shared/types/repairJobs";

interface TechnicianAssignmentModalProps {
  open: boolean;
  job: RepairJob;
  currentTechnician: RepairJobTechnician | null;
  onClose: () => void;
  onAssigned: (job: RepairJob, message: string) => void;
}

export function TechnicianAssignmentModal({
  open,
  job,
  currentTechnician,
  onClose,
  onAssigned,
}: TechnicianAssignmentModalProps) {
  const [technicians, setTechnicians] = useState<InternalUser[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setSelectedTechnicianId(currentTechnician?.id || "");
    setError("");
    setLoadingTechnicians(true);

    getTechnicians("active")
      .then((response) => {
        if (mounted) setTechnicians(response.technicians || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load active technicians.",
        );
      })
      .finally(() => {
        if (mounted) setLoadingTechnicians(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentTechnician?.id, open]);

  const selectedTechnician = useMemo(
    () => technicians.find((item) => item.id === selectedTechnicianId) || null,
    [selectedTechnicianId, technicians],
  );

  if (!open) return null;

  const confirmAssignment = async () => {
    if (!selectedTechnicianId || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await assignRepairJob(job.id, selectedTechnicianId);
      onAssigned(response.job, response.message);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to save the technician assignment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close technician assignment dialog"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={submitting ? undefined : onClose}
      />

      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <UserRoundCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">
                SCRUM-11 · Technician Assignment
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                {currentTechnician ? "Reassign technician" : "Assign technician"}
              </h2>
              <p className="mt-1 font-mono text-xs font-bold text-slate-500">
                {job.reference}
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

        <div className="space-y-5 p-6">
          <div>
            <label className="text-[12px] font-extrabold text-slate-700">
              Active technician
            </label>
            <select
              value={selectedTechnicianId}
              onChange={(event) => {
                setSelectedTechnicianId(event.target.value);
                setError("");
              }}
              disabled={loadingTechnicians || submitting}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">
                {loadingTechnicians ? "Loading technicians..." : "Select a technician"}
              </option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.fullName} · {technician.email}
                </option>
              ))}
            </select>
          </div>

          {selectedTechnician && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-blue-600">
                Confirmation
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                Assign <span className="text-blue-700">{selectedTechnician.fullName}</span> to repair job{" "}
                <span className="font-mono">{job.reference}</span>?
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                The change will immediately appear in that technician&apos;s assigned repair-job list.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loadingTechnicians && technicians.length === 0 && !error && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              No active, verified technicians are available for assignment.
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmAssignment}
            disabled={!selectedTechnicianId || loadingTechnicians || submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-extrabold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {submitting ? "Saving assignment..." : "Confirm assignment"}
          </button>
        </div>
      </section>
    </div>
  );
}
