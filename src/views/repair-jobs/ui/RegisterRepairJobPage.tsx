"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardPlus, ShieldCheck } from "lucide-react";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { RepairIntakeForm } from "@/src/widgets/repair-jobs/ui/RepairIntakeForm";

export function RegisterRepairJobPage() {
  return (
    <InternalDashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.20)]">
                <ClipboardPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">SCRUM-9 · Repair intake</p>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">Register Repair Job</h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Select an existing customer, record the received device and reported fault, then create a traceable repair job.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[11px] font-extrabold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Owner / Staff only
          </div>
        </div>

        <RepairIntakeForm />
      </div>
    </InternalDashboardShell>
  );
}
