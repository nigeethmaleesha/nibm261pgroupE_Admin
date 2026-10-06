"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileLock2,
  Play,
  RefreshCw,
  Save,
  ShieldCheck,
  Stethoscope,
  Wrench,
} from "lucide-react";
import {
  fetchTechnicianDiagnosis,
  saveTechnicianDiagnosis,
  startTechnicianDiagnosis,
} from "@/src/shared/api/diagnosis.api";
import { ApiError } from "@/src/shared/api/http";
import type {
  DiagnosisContextResponse,
  DiagnosisRecord,
} from "@/src/shared/types/diagnosis";
import { useToast } from "@/src/shared/ui/ToastProvider";

type DiagnosisFormProps = {
  jobIdentifier: string;
  onJobChanged?: () => void;
};

type FormState = {
  findings: string;
  recommendedWork: string;
  publicSummary: string;
  internalNotes: string;
  isUnrepairable: boolean;
  unrepairableReason: string;
};

const EMPTY_FORM: FormState = {
  findings: "",
  recommendedWork: "",
  publicSummary: "",
  internalNotes: "",
  isUnrepairable: false,
  unrepairableReason: "",
};

function formFromDiagnosis(diagnosis: DiagnosisRecord | null): FormState {
  if (!diagnosis) return EMPTY_FORM;
  return {
    findings: diagnosis.findings || "",
    recommendedWork: diagnosis.recommendedWork || "",
    publicSummary: diagnosis.publicSummary || "",
    internalNotes: diagnosis.internalNotes || "",
    isUnrepairable: Boolean(diagnosis.isUnrepairable),
    unrepairableReason: diagnosis.unrepairableReason || "",
  };
}

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

export function DiagnosisForm({ jobIdentifier, onJobChanged }: DiagnosisFormProps) {
  const toast = useToast();
  const [context, setContext] = useState<DiagnosisContextResponse | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiagnosis = useCallback(async () => {
    if (!jobIdentifier) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchTechnicianDiagnosis(jobIdentifier);
      setContext(response);
      setForm(formFromDiagnosis(response.diagnosis));
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Unable to load diagnosis details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobIdentifier]);

  useEffect(() => {
    void loadDiagnosis();
  }, [loadDiagnosis]);

  const isCompleted = Boolean(context?.diagnosis?.isCompleted);
  const canEdit = Boolean(context?.permissions.canEdit) && !isCompleted;
  const canStart = Boolean(context?.permissions.canStart);

  const completionIssues = useMemo(() => {
    const issues: string[] = [];
    if (!form.findings.trim()) issues.push("Diagnosis findings");
    if (!form.recommendedWork.trim()) issues.push("Recommended work");
    if (!form.publicSummary.trim()) issues.push("Customer-safe summary");
    if (form.isUnrepairable && !form.unrepairableReason.trim()) {
      issues.push("Unrepairable reason");
    }
    return issues;
  }, [form]);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const response = await startTechnicianDiagnosis(jobIdentifier);
      toast.success(response.message || "Diagnosis started successfully.");
      await loadDiagnosis();
      onJobChanged?.();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to start diagnosis.";
      setError(message);
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  };

  const save = async (complete: boolean) => {
    if (complete && completionIssues.length > 0) {
      const message = `Complete the required fields: ${completionIssues.join(", ")}.`;
      setError(message);
      toast.error(message);
      return;
    }

    complete ? setIsCompleting(true) : setIsSaving(true);
    setError(null);

    try {
      const response = await saveTechnicianDiagnosis(jobIdentifier, {
        findings: form.findings,
        recommendedWork: form.recommendedWork,
        publicSummary: form.publicSummary,
        internalNotes: form.internalNotes,
        isUnrepairable: form.isUnrepairable,
        unrepairableReason: form.isUnrepairable
          ? form.unrepairableReason
          : null,
        complete,
      });
      toast.success(response.message);
      await loadDiagnosis();
      onJobChanged?.();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : complete
            ? "Failed to complete diagnosis."
            : "Failed to save diagnosis draft.";
      setError(message);
      toast.error(message);
    } finally {
      complete ? setIsCompleting(false) : setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          Loading diagnosis workspace...
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950">Diagnosis Recording</h2>
              <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500">
                Record technical findings, recommended repairs, a customer-safe summary, and private workshop notes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-600">
              Job: {context?.job.status || "Unknown"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-black ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : context?.diagnosis
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {context?.job.diagnosisState || "Not Started"}
            </span>
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

        {!context?.diagnosis && canStart && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-indigo-950">Ready to begin diagnosis</h3>
                <p className="mt-1 text-xs font-medium leading-5 text-indigo-800/80">
                  Starting diagnosis changes the repair job from Received to Diagnosing and records the technician and start time.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                disabled={isStarting}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isStarting ? "Starting..." : "Start Diagnosis"}
              </button>
            </div>
          </div>
        )}

        {!context?.diagnosis && !canStart && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs font-semibold leading-5 text-amber-900">
            Diagnosis cannot be started from the current repair state ({context?.job.status || "Unknown"}).
          </div>
        )}

        {context?.diagnosis && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Started</p>
                <p className="mt-1 text-xs font-bold text-slate-800">{formatDate(context.diagnosis.startedAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">State</p>
                <p className="mt-1 text-xs font-bold text-slate-800">{context.diagnosis.state}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Completed</p>
                <p className="mt-1 text-xs font-bold text-slate-800">{formatDate(context.diagnosis.completedAt)}</p>
              </div>
            </div>

            {isCompleted && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold leading-5 text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-black">Diagnosis recorded and locked</p>
                  <p className="mt-0.5 text-emerald-800">
                    Owner/Staff can now use the completed diagnosis for estimate preparation. The record can no longer be overwritten.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="flex items-center gap-2 text-xs font-black text-slate-800">
                  <ClipboardCheck className="h-4 w-4 text-indigo-600" />
                  Diagnosis Findings <span className="text-rose-500">*</span>
                </span>
                <textarea
                  rows={6}
                  value={form.findings}
                  onChange={(event) => setForm((current) => ({ ...current, findings: event.target.value }))}
                  disabled={!canEdit}
                  placeholder="Record the actual technical findings discovered during inspection and testing..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-xs font-black text-slate-800">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  Recommended Work <span className="text-rose-500">*</span>
                </span>
                <textarea
                  rows={6}
                  value={form.recommendedWork}
                  onChange={(event) => setForm((current) => ({ ...current, recommendedWork: event.target.value }))}
                  disabled={!canEdit}
                  placeholder="List the repairs, replacements, or additional work recommended for this device..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </label>
            </div>

            <label className="block rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <span className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <Eye className="h-4 w-4 text-emerald-600" />
                Customer-safe Summary <span className="text-rose-500">*</span>
              </span>
              <p className="mt-1 text-[11px] font-medium text-emerald-800/80">
                This text is safe to expose through customer-facing responses. Do not include private workshop notes here.
              </p>
              <textarea
                rows={4}
                value={form.publicSummary}
                onChange={(event) => setForm((current) => ({ ...current, publicSummary: event.target.value }))}
                disabled={!canEdit}
                placeholder="Example: Testing confirmed a damaged charging assembly. Replacement is recommended before further repair work continues."
                className="mt-3 w-full resize-y rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </label>

            <label className="block rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <span className="flex items-center gap-2 text-xs font-black text-slate-900">
                <FileLock2 className="h-4 w-4 text-slate-600" />
                Internal Technical Notes
              </span>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                Internal only. This field is excluded from the customer diagnosis response.
              </p>
              <textarea
                rows={4}
                value={form.internalNotes}
                onChange={(event) => setForm((current) => ({ ...current, internalNotes: event.target.value }))}
                disabled={!canEdit}
                placeholder="Bench measurements, technician-only observations, parts sourcing notes, or other internal context..."
                className="mt-3 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </label>

            <div className={`rounded-2xl border p-4 ${form.isUnrepairable ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.isUnrepairable}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isUnrepairable: event.target.checked,
                      unrepairableReason: event.target.checked ? current.unrepairableReason : "",
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <p className="text-xs font-black text-slate-900">Mark this device as Unrepairable</p>
                  <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                    Use this only when the diagnosis confirms the device should not proceed through a normal repair path.
                  </p>
                </div>
              </label>

              {form.isUnrepairable && (
                <label className="mt-4 block">
                  <span className="text-xs font-black text-rose-800">
                    Unrepairable Reason <span className="text-rose-600">*</span>
                  </span>
                  <textarea
                    rows={3}
                    value={form.unrepairableReason}
                    disabled={!canEdit}
                    onChange={(event) => setForm((current) => ({ ...current, unrepairableReason: event.target.value }))}
                    placeholder="Record the technical reason this device is considered unrepairable..."
                    className="mt-2 w-full resize-y rounded-2xl border border-rose-200 bg-white p-4 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 disabled:bg-rose-50 disabled:text-slate-600"
                  />
                </label>
              )}
            </div>

            {canEdit && (
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Only the currently assigned technician can edit this diagnosis.
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void save(false)}
                    disabled={isSaving || isCompleting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void save(true)}
                    disabled={isSaving || isCompleting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCompleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {isCompleting ? "Completing..." : "Complete Diagnosis"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
