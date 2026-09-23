"use client";

import { ArrowLeft, Calculator, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getEstimateContext } from "@/src/shared/api/estimates.api";
import { ApiError } from "@/src/shared/api/http";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";

export function EstimateLookupPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = identifier.trim();
    if (!value || loading) return;
    setLoading(true);
    setError("");
    try {
      const context = await getEstimateContext(value);
      router.push(`/repair-jobs/${encodeURIComponent(context.job.id)}/estimate`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to find that repair job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InternalDashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-slate-500 transition hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-[0_8px_22px_rgba(124,58,237,0.20)]">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-600">SCRUM-14 · Estimates</p>
              <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">Create Repair Estimate</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Open a repair job by reference or database ID, then issue its first itemised estimate after diagnosis is complete.</p>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
            <ShieldCheck className="h-4 w-4" /> Owner / Staff only
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">Find repair job</h2>
          <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500">Use a reference such as <strong>JOB-202609-AB7K</strong> or paste the MongoDB repair job ID.</p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[12px] font-extrabold text-slate-700">Job reference / ID</span>
              <div className="relative mt-2">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={identifier}
                  onChange={(event) => { setIdentifier(event.target.value); setError(""); }}
                  placeholder="JOB-202609-XXXX or 24-character ObjectId"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-[13px] font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>
            {error && <InlineAlert>{error}</InlineAlert>}
            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-extrabold text-white shadow-[0_9px_22px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              <Search className="h-4 w-4" /> {loading ? "Checking job..." : "Open Estimate Editor"}
            </button>
          </form>
        </section>

        <InlineAlert kind="info">
          A first estimate can only be issued when the job is <strong>Diagnosing</strong>, the technician has completed diagnosis, and no estimate has been issued yet.
        </InlineAlert>
      </div>
    </InternalDashboardShell>
  );
}
