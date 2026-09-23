"use client";

import { Calculator, Plus, Send, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { issueInitialEstimate } from "@/src/shared/api/estimates.api";
import { ApiError } from "@/src/shared/api/http";
import type { EstimateLineType, IssueEstimateResponse } from "@/src/shared/types/estimates";
import { useToast } from "@/src/shared/ui/ToastProvider";

type DraftLine = {
  clientId: string;
  type: EstimateLineType;
  description: string;
  quantity: string;
  unitPrice: string;
};

type LineErrors = Partial<Record<"description" | "quantity" | "unitPrice", string>>;

const newLine = (): DraftLine => ({
  clientId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  type: "PART",
  description: "",
  quantity: "1",
  unitPrice: "",
});

function moneyMinor(value: string) {
  const match = value.trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  const whole = Number(match[1]);
  const cents = Number((match[2] || "").padEnd(2, "0"));
  const minor = whole * 100 + cents;
  return Number.isSafeInteger(minor) ? minor : null;
}

function lkr(minor: number) {
  return `LKR ${(minor / 100).toFixed(2)}`;
}

export function EstimateEditor({ jobIdentifier, onIssued }: { jobIdentifier: string; onIssued: (response: IssueEstimateResponse) => void }) {
  const toast = useToast();
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);
  const [errors, setErrors] = useState<Record<string, LineErrors>>({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const preview = useMemo(() => lines.map((line) => {
    const qty = Number(line.quantity);
    const unitMinor = moneyMinor(line.unitPrice);
    const lineMinor = Number.isSafeInteger(qty) && qty > 0 && unitMinor !== null ? qty * unitMinor : 0;
    return { id: line.clientId, lineMinor };
  }), [lines]);
  const totalMinor = preview.reduce((sum, line) => sum + line.lineMinor, 0);

  const update = (id: string, field: keyof Omit<DraftLine, "clientId">, value: string) => {
    setLines((current) => current.map((line) => line.clientId === id ? { ...line, [field]: value } : line));
    if (field !== "type") {
      setErrors((current) => ({ ...current, [id]: { ...current[id], [field]: undefined } }));
    }
    setGeneralError("");
  };

  const validate = () => {
    const next: Record<string, LineErrors> = {};
    lines.forEach((line) => {
      const lineErrors: LineErrors = {};
      if (!line.description.trim()) lineErrors.description = "Description is required.";
      else if (line.description.trim().length > 500) lineErrors.description = "Use 500 characters or fewer.";
      const qty = Number(line.quantity);
      if (!Number.isSafeInteger(qty) || qty < 1) lineErrors.quantity = "Use a positive whole number.";
      if (moneyMinor(line.unitPrice) === null) lineErrors.unitPrice = "Use a non-negative LKR value with at most 2 decimals.";
      if (Object.keys(lineErrors).length) next[line.clientId] = lineErrors;
    });
    setErrors(next);
    if (Object.keys(next).length) return false;
    if (totalMinor <= 0) {
      setGeneralError("Estimate total must exceed LKR 0.00.");
      return false;
    }
    return true;
  };

  const requestIssue = () => {
    if (validate()) setConfirming(true);
  };

  const issue = async () => {
    setConfirming(false);
    if (submitting || !validate()) return;
    setSubmitting(true);
    setGeneralError("");
    try {
      const response = await issueInitialEstimate(jobIdentifier, {
        items: lines.map((line) => ({
          type: line.type,
          description: line.description.trim(),
          quantity: Number(line.quantity),
          unitPrice: line.unitPrice.trim(),
        })),
      });
      toast.success(response.idempotentReplay ? "Existing estimate version 1 returned safely." : "Estimate version 1 issued successfully.");
      onIssued(response);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to issue the repair estimate.";
      setGeneralError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Calculator className="h-5 w-5" /></div>
            <div><h2 className="text-base font-black text-slate-950">Estimate line items</h2><p className="mt-0.5 text-[12px] font-medium text-slate-500">Parts and labour · LKR</p></div>
          </div>
          <button type="button" onClick={() => setLines((current) => [...current, newLine()])} disabled={submitting || lines.length >= 100} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 text-[12px] font-extrabold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"><Plus className="h-4 w-4" /> Add line</button>
        </div>

        <div className="mt-5 space-y-4">
          {lines.map((line, index) => {
            const linePreview = preview.find((item) => item.id === line.clientId)?.lineMinor || 0;
            const lineErrors = errors[line.clientId] || {};
            return (
              <div key={line.clientId} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-3 flex items-center justify-between"><p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">Line {index + 1}</p>{lines.length > 1 && <button type="button" onClick={() => setLines((current) => current.filter((item) => item.clientId !== line.clientId))} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove line ${index + 1}`}><Trash2 className="h-4 w-4" /></button>}</div>
                <div className="grid gap-3 md:grid-cols-[140px_1fr_110px_150px]">
                  <label><span className="text-[11px] font-extrabold text-slate-600">Type</span><select value={line.type} onChange={(e) => update(line.clientId, "type", e.target.value as EstimateLineType)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="PART">Part</option><option value="LABOUR">Labour</option></select></label>
                  <label><span className="text-[11px] font-extrabold text-slate-600">Description</span><input value={line.description} onChange={(e) => update(line.clientId, "description", e.target.value)} maxLength={500} placeholder="Item or work description" className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-[12px] font-semibold outline-none focus:ring-4 ${lineErrors.description ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`} />{lineErrors.description && <p className="mt-1 text-[10px] font-bold text-rose-600">{lineErrors.description}</p>}</label>
                  <label><span className="text-[11px] font-extrabold text-slate-600">Qty</span><input inputMode="numeric" value={line.quantity} onChange={(e) => update(line.clientId, "quantity", e.target.value)} className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-[12px] font-semibold outline-none focus:ring-4 ${lineErrors.quantity ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`} />{lineErrors.quantity && <p className="mt-1 text-[10px] font-bold text-rose-600">{lineErrors.quantity}</p>}</label>
                  <label><span className="text-[11px] font-extrabold text-slate-600">Unit price (LKR)</span><input inputMode="decimal" value={line.unitPrice} onChange={(e) => update(line.clientId, "unitPrice", e.target.value)} placeholder="0.00" className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-[12px] font-semibold outline-none focus:ring-4 ${lineErrors.unitPrice ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`} />{lineErrors.unitPrice && <p className="mt-1 text-[10px] font-bold text-rose-600">{lineErrors.unitPrice}</p>}</label>
                </div>
                <div className="mt-3 flex justify-end"><p className="text-[11px] font-bold text-slate-500">Line total <span className="ml-2 text-[13px] font-black text-slate-900">{lkr(linePreview)}</span></p></div>
              </div>
            );
          })}
        </div>

        {generalError && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-bold text-rose-700">{generalError}</p>}

        <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-slate-950 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Estimate total</p><p className="mt-1 text-2xl font-black">{lkr(totalMinor)}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">Server recalculates and stores the authoritative total.</p></div>
          <button type="button" onClick={requestIssue} disabled={submitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"><Send className="h-4 w-4" /> {submitting ? "Issuing..." : "Issue Estimate"}</button>
        </div>
      </section>

      {confirming && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-violet-600">Confirm issue</p><h3 className="mt-1 text-xl font-black text-slate-950">Issue version 1?</h3></div><button type="button" onClick={() => setConfirming(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <p className="mt-3 text-[13px] font-medium leading-6 text-slate-600">The estimate total is <strong className="text-slate-900">{lkr(totalMinor)}</strong>. After issue, version 1 and its line items are immutable. Later changes require a new version.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setConfirming(false)} className="h-11 rounded-xl border border-slate-200 px-4 text-[12px] font-extrabold text-slate-600">Cancel</button><button type="button" onClick={() => void issue()} className="h-11 rounded-xl bg-blue-600 px-4 text-[12px] font-extrabold text-white">Confirm & Issue</button></div>
          </div>
        </div>
      )}
    </>
  );
}
