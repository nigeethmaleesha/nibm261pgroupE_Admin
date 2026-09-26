"use client";

import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  History,
  RefreshCw,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  fetchStaffProgressHistory,
  getEstimateContext,
  getEstimateHistory,
} from "@/src/shared/api/estimates.api";
import { ApiError } from "@/src/shared/api/http";
import type {
  EstimateContextResponse,
  EstimateHistoryResponse,
  EstimateHistoryVersionItem,
  ProgressUpdate,
} from "@/src/shared/types/estimates";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { LoadingScreen } from "@/src/shared/ui/LoadingScreen";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { EstimateEditor } from "@/src/widgets/estimates/ui/EstimateEditor";
import { IssuedEstimateCard } from "@/src/widgets/estimates/ui/IssuedEstimateCard";

export function RepairEstimatePage() {
  const params = useParams<{ jobIdentifier: string }>();
  const jobIdentifier = decodeURIComponent(params.jobIdentifier || "");
  const [context, setContext] = useState<EstimateContextResponse | null>(null);
  const [history, setHistory] = useState<EstimateHistoryResponse | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRevisionEditor, setShowRevisionEditor] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!jobIdentifier) return;
    setLoading(true);
    setError("");
    try {
      const [ctxRes, progressRes, historyRes] = await Promise.allSettled([
        getEstimateContext(jobIdentifier),
        fetchStaffProgressHistory(jobIdentifier),
        getEstimateHistory(jobIdentifier),
      ]);

      if (ctxRes.status === "fulfilled") {
        setContext(ctxRes.value);
      } else {
        throw ctxRes.reason;
      }

      if (progressRes.status === "fulfilled") {
        setProgressUpdates(progressRes.value.updates || []);
      }

      if (historyRes.status === "fulfilled") {
        setHistory(historyRes.value);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load estimate context.");
    } finally {
      setLoading(false);
    }
  }, [jobIdentifier]);

  useEffect(() => { void load(); }, [load]);

  if (loading && !context) return <LoadingScreen label="Loading repair estimate..." />;

  const canRevise = Boolean(
    context?.currentEstimate &&
    (context.revisionEligibility?.eligible ?? true)
  );

  const approvedVersionNumber = history?.workAuthorisation?.approvedVersionNumber;
  const approvedVersion = history?.versions.find(
    (v) => v.versionNumber === approvedVersionNumber
  );

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
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-600">SCRUM-14 / SCRUM-17 / SCRUM-19 · Repair Estimate &amp; History</p>
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

            {/* Active Repair Work Authorisation Callout for Owner/Staff */}
            {approvedVersion ? (
              <section className="rounded-2xl border border-emerald-300/80 bg-emerald-50/70 p-5 text-emerald-950 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-emerald-950">Active Work Authorisation Scope</h2>
                    <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-emerald-900">
                      Customer has approved <strong className="font-bold text-slate-950">Estimate Version {approvedVersion.versionNumber}</strong> for <strong className="font-bold text-slate-950">LKR {approvedVersion.total}</strong> on {approvedVersion.decision?.decidedAt ? new Date(approvedVersion.decision.decidedAt).toLocaleString() : "record"}.
                    </p>
                    {context.currentEstimate && context.currentEstimate.versionNumber > approvedVersion.versionNumber && (
                      <p className="mt-2 text-[11.5px] font-bold text-amber-900 bg-amber-100/80 border border-amber-300/70 rounded-lg p-2.5">
                        ⚠️ Note: Latest Version {context.currentEstimate.versionNumber} is currently {context.currentEstimate.status === "Rejected" ? "REJECTED by customer" : "AWAITING customer approval"}. Work is authorized to proceed ONLY under approved Version {approvedVersion.versionNumber} scope.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ) : context.currentEstimate ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-semibold leading-relaxed text-amber-950">
                <p>⚠️ No estimate has been approved by the customer yet. Repair work is not authorized until the customer approves an issued estimate.</p>
              </section>
            ) : null}

            {/* Technician Bench Notes & Progress Updates Card */}
            <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-950">Technician Bench Progress Notes &amp; New Issue Findings</h2>
                  <p className="text-[11px] font-medium text-slate-500">Notes logged by technicians on bench during inspection/repair</p>
                </div>
              </div>

              {progressUpdates.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {progressUpdates.map((update) => (
                    <div key={update.id} className="rounded-xl border border-slate-200 bg-white p-4 text-[12px] shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">
                            {update.updatedBy?.name || "Technician"}
                          </span>
                          {update.updatedBy?.role && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                              {update.updatedBy.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {update.fromStatus !== update.toStatus && (
                        <p className="mt-2 text-[11px] font-bold text-violet-700">
                          Status updated: <span className="text-slate-600 font-medium">{update.fromStatus} &rarr; {update.toStatus}</span>
                        </p>
                      )}
                      {update.note ? (
                        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200/60 p-3 text-[12.5px] font-medium leading-relaxed text-amber-950">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3 inline" /> Bench Finding / Progress Note:
                          </p>
                          {update.note}
                        </div>
                      ) : (
                        <p className="mt-1 text-[11px] italic text-slate-400">No text note provided with status update.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[12px] font-semibold text-slate-500 italic bg-white/70 rounded-xl p-4 border border-slate-200">
                  No technician bench notes or progress updates recorded yet.
                </p>
              )}
            </section>

            {/* Current Estimate Card & Revision Editor */}
            {context.currentEstimate ? (
              <div className="space-y-4">
                <IssuedEstimateCard estimate={context.currentEstimate} />

                {showRevisionEditor ? (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowRevisionEditor(false)}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-extrabold text-slate-600 transition hover:bg-slate-50"
                      >
                        Cancel Revision
                      </button>
                    </div>
                    <EstimateEditor
                      jobIdentifier={context.job.id}
                      isRevision={true}
                      baseVersionNumber={context.currentEstimate.versionNumber}
                      initialItems={context.currentEstimate.items}
                      onIssued={(response) => {
                        setShowRevisionEditor(false);
                        setContext((current) => current ? {
                          ...current,
                          job: { ...current.job, status: response.jobStatus },
                          currentEstimate: response.estimate,
                        } : current);
                        void load();
                      }}
                    />
                  </div>
                ) : (
                  canRevise && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-950">Need to update repair work or cost?</h3>
                        <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                          Issue a new sequential estimate version if technician found new issues or repair scope changed.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRevisionEditor(true)}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-[12px] font-extrabold text-white transition hover:bg-violet-500"
                      >
                        <RefreshCw className="h-4 w-4" /> Issue Estimate Revision
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : context.eligibility.eligible ? (
              <EstimateEditor
                jobIdentifier={context.job.id}
                onIssued={(response) => {
                  setContext((current) => current ? {
                    ...current,
                    job: { ...current.job, status: response.jobStatus },
                    eligibility: { eligible: false, reasons: ["An initial estimate has already been issued for this repair job"] },
                    currentEstimate: response.estimate,
                  } : current);
                  void load();
                }}
              />
            ) : (
              <InlineAlert kind="info">
                <strong>Estimate cannot be issued yet.</strong>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {context.eligibility.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </InlineAlert>
            )}

            {/* Estimate Version History & Decision Audit Log Card (SCRUM-19) */}
            {history && history.versions.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-950">Estimate Version History &amp; Decision Audit Log</h2>
                    <p className="text-[12px] font-medium text-slate-500">Immutable record of all issued versions and customer decisions</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {history.versions.map((ver) => (
                    <HistoryVersionCard
                      key={ver.id}
                      version={ver}
                      isExpanded={expandedVersionId === ver.id}
                      onToggle={() => setExpandedVersionId((current) => current === ver.id ? null : ver.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </InternalDashboardShell>
  );
}

function HistoryVersionCard({
  version,
  isExpanded,
  onToggle,
}: {
  version: EstimateHistoryVersionItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isApproved = version.decision?.action === "APPROVED" || version.status === "Approved";
  const isRejected = version.decision?.action === "REJECTED" || version.status === "Rejected";

  return (
    <div className={`rounded-2xl border transition-all ${version.isCurrent ? "border-violet-300 bg-violet-50/20" : "border-slate-200 bg-slate-50/50"}`}>
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 font-black text-xs text-slate-800">
            v{version.versionNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-950">Version {version.versionNumber}</h3>
              {version.isCurrent && (
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-black text-violet-700">
                  Current Version
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Issued {new Date(version.issuedAt).toLocaleString()} · Total: <strong className="text-slate-900">LKR {version.total}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isApproved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Approved
            </span>
          )}
          {isRejected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-extrabold text-rose-700 border border-rose-200">
              <XCircle className="h-3.5 w-3.5 text-rose-600" /> Rejected
            </span>
          )}
          {!isApproved && !isRejected && version.supersededBy && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-600 border border-slate-200">
              Superseded
            </span>
          )}
          {!isApproved && !isRejected && !version.supersededBy && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-700 border border-amber-200">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Awaiting Approval
            </span>
          )}

          <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {version.changeReason && (
        <div className="px-4 pb-3 -mt-1 text-[12px] font-medium text-slate-600">
          <span className="font-bold text-slate-800">Change Reason: </span>
          {version.changeReason}
        </div>
      )}

      {version.decision && (
        <div className="px-4 pb-3 text-[11px] font-semibold text-slate-500 border-t border-slate-100/80 pt-2">
          Decision by customer on {new Date(version.decision.decidedAt).toLocaleString()} &mdash; Status: <strong className={isApproved ? "text-emerald-700" : "text-rose-700"}>{version.decision.action}</strong>
        </div>
      )}

      {isExpanded && (
        <div className="border-t border-slate-200 bg-white p-4 rounded-b-2xl space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Line Items in Version {version.versionNumber}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold">
                  <th className="py-2">Type</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {version.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-bold text-violet-700">{item.type}</td>
                    <td className="py-2 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="py-2 text-right font-medium text-slate-600">LKR {item.unitPrice}</td>
                    <td className="py-2 text-right font-extrabold text-slate-950">LKR {item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
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
