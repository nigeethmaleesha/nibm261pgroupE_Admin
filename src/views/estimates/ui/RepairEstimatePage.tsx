"use client";

import { ArrowLeft, Calculator, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getEstimateContext } from "@/src/shared/api/estimates.api";
import { ApiError } from "@/src/shared/api/http";
import type { EstimateContextResponse } from "@/src/shared/types/estimates";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { LoadingScreen } from "@/src/shared/ui/LoadingScreen";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { EstimateEditor } from "@/src/widgets/estimates/ui/EstimateEditor";
import { IssuedEstimateCard } from "@/src/widgets/estimates/ui/IssuedEstimateCard";

export function RepairEstimatePage() {
  const params = useParams<{ jobIdentifier: string }>();
  const jobIdentifier = decodeURIComponent(params.jobIdentifier || "");
  const [context, setContext] = useState<EstimateContextResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!jobIdentifier) return;
    setLoading(true);
    setError("");
    try {
      setContext(await getEstimateContext(jobIdentifier));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load estimate context.");
    } finally {
      setLoading(false);
    }
  }, [jobIdentifier]);

  useEffect(() => { void load(); }, [load]);

  if (loading && !context) return <LoadingScreen label="Loading repair estimate..." />;

  return (
    <InternalDashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/repair-jobs/estimate" className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-slate-500 transition hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" /> Find another job
            </Link>
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-600">SCRUM-14 · Initial estimate</p>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">{context?.job.reference || "Repair Estimate"}</h1>
                {context && <p className="mt-2 text-sm font-medium text-slate-500">{context.job.deviceType} · {context.job.makeModel} · {context.job.customer.fullName}</p>}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[12px] font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {error && <InlineAlert>{error}</InlineAlert>}

        {context && (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-slate-950">Repair context</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-600">{context.job.status}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Info label="Customer" value={context.job.customer.fullName} />
                  <Info label="Contact" value={context.job.customer.contactNumber} />
                  <Info label="Device" value={`${context.job.deviceType} · ${context.job.makeModel}`} />
                  <Info label="Serial" value={context.job.serialNumber || "Not recorded"} />
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Reported fault</p>
                  <p className="mt-1.5 text-[13px] font-semibold leading-6 text-slate-700">{context.job.reportedFault}</p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-black text-slate-950">Diagnosis</h2>
                {context.diagnosis ? (
                  <div className="mt-4 space-y-3 text-[12px] font-semibold leading-5 text-slate-600">
                    <Info label="Completed" value={context.diagnosis.completedAt ? new Date(context.diagnosis.completedAt).toLocaleString() : "Completed"} />
                    <Info label="Recommended work" value={context.diagnosis.recommendedWork || "Completed diagnosis available"} />
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] font-semibold leading-5 text-amber-700">No completed diagnosis is available yet.</p>
                )}
              </section>
            </div>

            {context.currentEstimate ? (
              <IssuedEstimateCard estimate={context.currentEstimate} />
            ) : context.eligibility.eligible ? (
              <EstimateEditor jobIdentifier={context.job.id} onIssued={(response) => {
                setContext((current) => current ? {
                  ...current,
                  job: { ...current.job, status: response.jobStatus },
                  eligibility: { eligible: false, reasons: ["An initial estimate has already been issued for this repair job"] },
                  currentEstimate: response.estimate,
                } : current);
              }} />
            ) : (
              <InlineAlert kind="info">
                <strong>Estimate cannot be issued yet.</strong>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {context.eligibility.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </InlineAlert>
            )}
          </>
        )}
      </div>
    </InternalDashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-slate-400">{label}</p>
      <p className="mt-1 text-[12px] font-extrabold leading-5 text-slate-700">{value}</p>
    </div>
  );
}
