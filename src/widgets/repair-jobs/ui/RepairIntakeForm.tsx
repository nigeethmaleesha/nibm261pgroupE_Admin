"use client";

import { ClipboardCheck, RotateCcw, Save, Smartphone } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { createRepairJob } from "@/src/shared/api/repairJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type {
  CreateRepairJobPayload,
  RepairCustomer,
  RepairJob,
} from "@/src/shared/types/repairJobs";
import { useToast } from "@/src/shared/ui/ToastProvider";
import { CustomerLookup } from "./CustomerLookup";

type FormState = {
  deviceType: string;
  makeModel: string;
  serialNumber: string;
  reportedFault: string;
};

type FieldErrors = Partial<Record<keyof FormState | "customer", string>>;

const initialForm: FormState = {
  deviceType: "",
  makeModel: "",
  serialNumber: "",
  reportedFault: "",
};

function createClientKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `repair-intake-${crypto.randomUUID()}`;
  }
  return `repair-intake-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function payloadSignature(payload: CreateRepairJobPayload) {
  return JSON.stringify({
    customerId: payload.customerId.trim(),
    deviceType: payload.deviceType.trim(),
    makeModel: payload.makeModel.trim(),
    serialNumber: payload.serialNumber?.trim() || "",
    reportedFault: payload.reportedFault.trim(),
  });
}

function formatReceivedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function RepairIntakeForm() {
  const toast = useToast();
  const [customer, setCustomer] = useState<RepairCustomer | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdJob, setCreatedJob] = useState<RepairJob | null>(null);
  const [wasReplay, setWasReplay] = useState(false);
  const submitKeyRef = useRef("");
  const submitSignatureRef = useRef("");

  const canSubmit = useMemo(
    () => Boolean(customer && form.deviceType.trim() && form.makeModel.trim() && form.reportedFault.trim()),
    [customer, form],
  );

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next: FieldErrors = {};
    if (!customer) next.customer = "Select an existing registered customer.";
    if (!form.deviceType.trim()) next.deviceType = "Device type is required.";
    if (form.deviceType.trim().length > 80) next.deviceType = "Device type must be 80 characters or fewer.";
    if (!form.makeModel.trim()) next.makeModel = "Make/model is required.";
    if (form.makeModel.trim().length > 160) next.makeModel = "Make/model must be 160 characters or fewer.";
    if (form.serialNumber.trim().length > 120) next.serialNumber = "Serial number must be 120 characters or fewer.";
    if (!form.reportedFault.trim()) next.reportedFault = "Reported fault is required.";
    if (form.reportedFault.trim().length > 2000) next.reportedFault = "Reported fault must be 2000 characters or fewer.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !validate() || !customer) return;

    const payload: CreateRepairJobPayload = {
      customerId: customer.id,
      deviceType: form.deviceType.trim(),
      makeModel: form.makeModel.trim(),
      ...(form.serialNumber.trim() ? { serialNumber: form.serialNumber.trim() } : {}),
      reportedFault: form.reportedFault.trim(),
    };

    const signature = payloadSignature(payload);
    if (!submitKeyRef.current || submitSignatureRef.current !== signature) {
      submitKeyRef.current = createClientKey();
      submitSignatureRef.current = signature;
    }

    setSubmitting(true);
    try {
      const response = await createRepairJob(payload, submitKeyRef.current);
      setCreatedJob(response.job);
      setWasReplay(response.idempotentReplay);
      toast.success(
        response.idempotentReplay
          ? `Existing repair job ${response.job.reference} returned safely.`
          : `Repair job ${response.job.reference} registered successfully.`,
      );
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to register the repair job.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setCustomer(null);
    setForm(initialForm);
    setErrors({});
    setCreatedJob(null);
    setWasReplay(false);
    submitKeyRef.current = "";
    submitSignatureRef.current = "";
  };

  if (createdJob) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
          {wasReplay ? "Duplicate prevented" : "Repair job registered"}
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950">{createdJob.reference}</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {wasReplay
            ? "The same intake request had already been saved, so RepairFlow returned the existing job instead of creating a duplicate."
            : "The device intake is saved and ready for the next repair workflow step."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Customer", createdJob.customer.fullName],
            ["Status", createdJob.status],
            ["Device", `${createdJob.deviceType} · ${createdJob.makeModel}`],
            ["Received", formatReceivedAt(createdJob.receivedAt)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-slate-400">{label}</p>
              <p className="mt-1.5 text-[13px] font-extrabold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-slate-400">Reported fault</p>
          <p className="mt-2 whitespace-pre-wrap text-[13px] font-medium leading-6 text-slate-700">{createdJob.reportedFault}</p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-extrabold text-white shadow-[0_9px_22px_rgba(37,99,235,0.20)] transition hover:bg-blue-700"
        >
          <RotateCcw className="h-4 w-4" />
          Register another repair job
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <span className="text-sm font-black">1</span>
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950">Select registered customer</h2>
            <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500">
              Repair intake must be linked to an existing active and verified customer account.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <CustomerLookup
            selectedCustomer={customer}
            disabled={submitting}
            onSelect={(value) => {
              setCustomer(value);
              setErrors((current) => ({ ...current, customer: undefined }));
            }}
          />
          {errors.customer && <p className="mt-2 text-[11px] font-bold text-rose-600">{errors.customer}</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950">Device intake details</h2>
            <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500">
              Record the device information exactly as received from the customer.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[12px] font-extrabold text-slate-700">Device type <span className="text-rose-500">*</span></span>
            <input
              value={form.deviceType}
              disabled={submitting}
              maxLength={80}
              onChange={(event) => updateField("deviceType", event.target.value)}
              placeholder="e.g. Mobile Phone, Laptop, Tablet"
              className={`mt-2 h-12 w-full rounded-xl border bg-white px-3.5 text-[13px] font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${errors.deviceType ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
            />
            {errors.deviceType && <p className="mt-1.5 text-[11px] font-bold text-rose-600">{errors.deviceType}</p>}
          </label>

          <label className="block">
            <span className="text-[12px] font-extrabold text-slate-700">Make / model <span className="text-rose-500">*</span></span>
            <input
              value={form.makeModel}
              disabled={submitting}
              maxLength={160}
              onChange={(event) => updateField("makeModel", event.target.value)}
              placeholder="e.g. Samsung Galaxy A54"
              className={`mt-2 h-12 w-full rounded-xl border bg-white px-3.5 text-[13px] font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${errors.makeModel ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
            />
            {errors.makeModel && <p className="mt-1.5 text-[11px] font-bold text-rose-600">{errors.makeModel}</p>}
          </label>

          <label className="block sm:col-span-2">
            <span className="text-[12px] font-extrabold text-slate-700">Serial number <span className="font-semibold text-slate-400">(optional)</span></span>
            <input
              value={form.serialNumber}
              disabled={submitting}
              maxLength={120}
              onChange={(event) => updateField("serialNumber", event.target.value)}
              placeholder="Enter the device serial number when available"
              className={`mt-2 h-12 w-full rounded-xl border bg-white px-3.5 text-[13px] font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${errors.serialNumber ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
            />
            {errors.serialNumber && <p className="mt-1.5 text-[11px] font-bold text-rose-600">{errors.serialNumber}</p>}
          </label>

          <label className="block sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-extrabold text-slate-700">Reported fault <span className="text-rose-500">*</span></span>
              <span className="text-[10px] font-bold text-slate-400">{form.reportedFault.length}/2000</span>
            </div>
            <textarea
              value={form.reportedFault}
              disabled={submitting}
              maxLength={2000}
              rows={6}
              onChange={(event) => updateField("reportedFault", event.target.value)}
              placeholder="Describe the fault reported by the customer..."
              className={`mt-2 w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-[13px] font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${errors.reportedFault ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
            />
            {errors.reportedFault && <p className="mt-1.5 text-[11px] font-bold text-rose-600">{errors.reportedFault}</p>}
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-medium leading-5 text-slate-400">
          RepairFlow automatically creates the unique job reference, intake time and initial <strong className="text-slate-500">Received</strong> status.
        </p>
        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-extrabold text-white shadow-[0_9px_22px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Registering..." : "Register Repair Job"}
        </button>
      </div>
    </form>
  );
}
