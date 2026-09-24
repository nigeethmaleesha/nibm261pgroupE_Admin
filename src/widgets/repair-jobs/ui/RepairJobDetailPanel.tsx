"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  CircleUserRound,
  Cpu,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import type { RepairJob } from "@/src/shared/types/repairJobs";
import { TechnicianAssignmentModal } from "./TechnicianAssignmentModal";

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLkr(minor?: number) {
  if (typeof minor !== "number") return "—";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

function statusClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "collected") return "border-slate-200 bg-slate-100 text-slate-600";
  if (normalized.includes("ready")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized.includes("waiting") || normalized.includes("awaiting")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (normalized.includes("repair") || normalized === "approved") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }
  if (normalized.includes("diagnos")) return "border-cyan-200 bg-cyan-50 text-cyan-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

interface RepairJobDetailPanelProps {
  job: RepairJob | null;
  loading: boolean;
  error: string;
  successMessage: string;
  onRetry: () => void;
  onAssigned: (job: RepairJob, message: string) => void;
}

export function RepairJobDetailPanel({
  job,
  loading,
  error,
  successMessage,
  onRetry,
  onAssigned,
}: RepairJobDetailPanelProps) {
  const [assignmentOpen, setAssignmentOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[620px] animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
        <div className="h-7 w-48 rounded-lg bg-slate-100" />
        <div className="mt-4 h-20 rounded-2xl bg-slate-100" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="h-44 rounded-2xl bg-slate-100" />
          <div className="h-44 rounded-2xl bg-slate-100" />
        </div>
        <div className="mt-5 h-36 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-900">Unable to open repair job</h3>
        <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Wrench className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-900">Select a repair job</h3>
        <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
          Choose a result to open the saved intake details, current status, and technician assignment controls.
        </p>
      </div>
    );
  }

  const collected = job.status === "Collected";
  const technician = job.assignment?.technician || job.assignedTechnician || null;

  return (
    <>
      <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_42px_rgba(15,23,42,0.055)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">
              SCRUM-10 · Job Overview
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <h2 className="font-mono text-xl font-black tracking-wide text-slate-950">
                {job.reference}
              </h2>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold ${statusClasses(job.status)}`}>
                {job.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {job.deviceType} · {job.makeModel}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAssignmentOpen(true)}
            disabled={collected}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            <UserRoundCheck className="h-4 w-4" />
            {technician ? "Reassign technician" : "Assign technician"}
          </button>
        </div>

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {collected && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            This job is Collected. Technician assignment changes are locked by the backend workflow rule.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <CircleUserRound className="h-4 w-4 text-emerald-600" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-700">Customer</h3>
            </div>
            <p className="mt-4 text-base font-black text-slate-950">{job.customer.fullName}</p>
            <div className="mt-3 space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {job.customer.contactNumber}</div>
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <span className="truncate">{job.customer.email}</span></div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-700">Device intake</h3>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-4"><span className="font-semibold text-slate-500">Device</span><span className="text-right font-extrabold text-slate-900">{job.deviceType}</span></div>
              <div className="flex items-start justify-between gap-4"><span className="font-semibold text-slate-500">Make / Model</span><span className="text-right font-extrabold text-slate-900">{job.makeModel}</span></div>
              <div className="flex items-start justify-between gap-4"><span className="font-semibold text-slate-500">Serial No.</span><span className="text-right font-mono font-extrabold text-slate-900">{job.serialNumber || "Not provided"}</span></div>
              <div className="flex items-start justify-between gap-4"><span className="font-semibold text-slate-500">Received</span><span className="text-right font-extrabold text-slate-900">{formatDate(job.receivedAt)}</span></div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-700">Reported fault / saved intake</h3>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-[13px] font-medium leading-6 text-slate-700">
            {job.reportedFault}
          </p>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50/45 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-blue-600">SCRUM-11 · Assignment</p>
              <h3 className="mt-1 text-sm font-black text-slate-950">
                {technician?.fullName || "No technician assigned"}
              </h3>
            </div>
            <UserRoundCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-white/85 p-3">
              <p className="font-semibold text-slate-400">Technician</p>
              <p className="mt-1 font-extrabold text-slate-800">{technician?.email || "—"}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white/85 p-3">
              <p className="font-semibold text-slate-400">Assigned at</p>
              <p className="mt-1 font-extrabold text-slate-800">{formatDate(job.assignment?.assignedAt || job.assignedAt)}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white/85 p-3 sm:col-span-2">
              <p className="font-semibold text-slate-400">Assigned by</p>
              <p className="mt-1 font-extrabold text-slate-800">{job.assignment?.assignedBy?.fullName || "Not recorded"}</p>
            </div>
          </div>
        </section>

        {job.currentEstimate && (
          <section className="rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-violet-600" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.08em] text-violet-700">Current estimate</h3>
            </div>
            <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
              <div><p className="font-semibold text-slate-400">Version</p><p className="mt-1 font-extrabold text-slate-900">v{job.currentEstimate.versionNumber}</p></div>
              <div><p className="font-semibold text-slate-400">Status</p><p className="mt-1 font-extrabold text-slate-900">{job.currentEstimate.status}</p></div>
              <div><p className="font-semibold text-slate-400">Total</p><p className="mt-1 font-extrabold text-slate-900">{formatLkr(job.currentEstimate.totalMinor)}</p></div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-[11px] font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Last updated {formatDate(job.updatedAt)}</span>
          <span className="font-mono">Job ID: {job.id}</span>
        </div>
      </div>

      <TechnicianAssignmentModal
        open={assignmentOpen}
        job={job}
        currentTechnician={technician}
        onClose={() => setAssignmentOpen(false)}
        onAssigned={onAssigned}
      />
    </>
  );
}
