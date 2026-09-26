"use client";

import { BadgeCheck, LockKeyhole } from "lucide-react";
import type { IssuedEstimate } from "@/src/shared/types/estimates";

export function IssuedEstimateCard({ estimate }: { estimate: IssuedEstimate }) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><BadgeCheck className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Estimate issued</p>
            <h2 className="text-lg font-black text-slate-950">Version {estimate.versionNumber}</h2>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-extrabold text-slate-600"><LockKeyhole className="h-3.5 w-3.5" /> Immutable</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="hidden grid-cols-[90px_1fr_80px_130px_130px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400 md:grid">
          <span>Type</span><span>Description</span><span>Qty</span><span>Unit price</span><span className="text-right">Line total</span>
        </div>
        {estimate.items.map((item) => (
          <div key={item.id} className="grid gap-2 border-t border-slate-100 px-4 py-4 text-[12px] first:border-t-0 md:grid-cols-[90px_1fr_80px_130px_130px] md:items-center md:gap-3">
            <span className="font-extrabold text-violet-700">{item.type === "PART" ? "Part" : "Labour"}</span>
            <span className="font-semibold text-slate-700">{item.description}</span>
            <span className="font-bold text-slate-600">{item.quantity}</span>
            <span className="font-bold text-slate-600">LKR {item.unitPrice}</span>
            <span className="font-black text-slate-900 md:text-right">LKR {item.lineTotal}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-white">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Issued</p><p className="mt-1 text-[12px] font-bold">{new Date(estimate.issuedAt).toLocaleString()}</p></div>
        <div className="text-right"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Total</p><p className="mt-1 text-xl font-black">LKR {estimate.total}</p></div>
      </div>
    </section>
  );
}
