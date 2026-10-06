"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Lock,
  Package,
  PackageCheck,
  Phone,
  Printer,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Tag,
  User,
  UserCheck,
  UserRound,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { getArchivedJobDetail } from "@/src/shared/api/archive.api";
import type {
  ArchivedJobDossier,
  EstimateDossierItem,
  EventLedgerItem,
} from "@/src/shared/types/archive";

interface JobDossierModalProps {
  jobIdentifier: string | null;
  onClose: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "Not recorded";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
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

export function JobDossierModal({ jobIdentifier, onClose }: JobDossierModalProps) {
  const [dossier, setDossier] = useState<ArchivedJobDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "diagnosis" | "estimates" | "workshop" | "handover" | "ledger"
  >("overview");
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!jobIdentifier) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getArchivedJobDetail(jobIdentifier)
      .then((data) => {
        if (isMounted) {
          setDossier(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || "Failed to load archived job dossier.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [jobIdentifier]);

  if (!jobIdentifier) return null;

  const copyReference = () => {
    if (!dossier?.job?.reference) return;
    navigator.clipboard.writeText(dossier.job.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredLedger = dossier?.eventLedger.filter((event) => {
    if (ledgerCategoryFilter === "all") return true;
    return event.category === ledgerCategoryFilter;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 sm:p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Top Lock Banner & Header */}
        <div className="flex flex-col border-b border-slate-200/90 bg-slate-900 text-white">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-extrabold uppercase tracking-widest text-[11px] text-blue-300">
                Official Staff Service Record • Read-Only Archive
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print Dossier</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {dossier ? dossier.job.reference : "Loading dossier..."}
                </h2>
                {dossier && (
                  <button
                    type="button"
                    onClick={copyReference}
                    title="Copy Reference"
                    className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                )}
                <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                  Status: Collected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {dossier ? `${dossier.job.makeModel} (${dossier.job.deviceType}) • Customer: ${dossier.job.customerSnapshot?.fullName}` : ""}
              </p>
            </div>

            {/* Outcome Pill in Header */}
            {dossier && (
              <div className="flex items-center gap-2">
                {dossier.outcome === "repaired" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <div className="text-left leading-tight">
                      <p className="text-xs font-black uppercase tracking-wider">Repaired & Handed Over</p>
                      <p className="text-[10px] text-emerald-300/80">Turnaround: {dossier.summary.durationDays} days</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-amber-400">
                    <XCircle className="h-5 w-5" />
                    <div className="text-left leading-tight">
                      <p className="text-xs font-black uppercase tracking-wider">Unrepaired Return</p>
                      <p className="text-[10px] text-amber-300/80">Returned to customer without repair</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/80 px-6 py-1 scrollbar-none">
          <div className="flex gap-2">
            {[
              { id: "overview", label: "Intake & Device", icon: FileText },
              { id: "diagnosis", label: "Diagnosis & Notes", icon: Wrench },
              { id: "estimates", label: `Estimates (${dossier?.estimates?.length || 0})`, icon: ReceiptText },
              { id: "workshop", label: `Workshop Logs (${dossier?.workshopLogs?.length || 0})`, icon: Layers },
              { id: "handover", label: "QC & Handover", icon: PackageCheck },
              { id: "ledger", label: `Event Ledger (${dossier?.eventLedger?.length || 0})`, icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-extrabold transition whitespace-nowrap ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-xs font-bold text-slate-600">Loading comprehensive service dossier...</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-2">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
              <h4 className="text-sm font-extrabold text-rose-900">Failed to load dossier</h4>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          )}

          {dossier && !loading && (
            <div className="space-y-6">
              {/* TAB 1: OVERVIEW & INTAKE */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Grid of Intake Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Customer Information */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                        <UserRound className="h-4 w-4 text-blue-600" />
                        <span>Customer Snapshot</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-slate-400 font-semibold">Full Name</p>
                          <p className="font-extrabold text-slate-900 text-sm">{dossier.job.customerSnapshot?.fullName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-slate-400 font-semibold">Contact Number</p>
                            <p className="font-bold text-slate-800">{dossier.job.customerSnapshot?.contactNumber || "—"}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold">Email Address</p>
                            <p className="font-bold text-slate-800 truncate">{dossier.job.customerSnapshot?.email || "—"}</p>
                          </div>
                        </div>
                        {dossier.job.customerSnapshot?.alternateContactNumber && (
                          <div>
                            <p className="text-slate-400 font-semibold">Alternate Phone</p>
                            <p className="font-bold text-slate-800">{dossier.job.customerSnapshot.alternateContactNumber}</p>
                          </div>
                        )}
                        {dossier.job.customerSnapshot?.address && (
                          <div>
                            <p className="text-slate-400 font-semibold">Physical Address</p>
                            <p className="font-bold text-slate-800">{dossier.job.customerSnapshot.address}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Device & Fault Details */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                        <Cpu className="h-4 w-4 text-blue-600" />
                        <span>Device & Intake Details</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-slate-400 font-semibold">Make & Model</p>
                            <p className="font-extrabold text-slate-900">{dossier.job.makeModel}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold">Device Type</p>
                            <p className="font-bold text-slate-800">{dossier.job.deviceType}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold">Serial Number</p>
                          <p className="font-bold text-slate-800">{dossier.job.serialNumber || "None recorded"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold">Physical Condition on Intake</p>
                          <p className="font-bold text-slate-800">{dossier.job.physicalCondition || "Standard condition / No notes"}</p>
                        </div>
                        {dossier.job.accessories && dossier.job.accessories.length > 0 && (
                          <div>
                            <p className="text-slate-400 font-semibold">Received Accessories</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {dossier.job.accessories.map((acc, idx) => (
                                <span key={idx} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                  {acc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reported Fault Box */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Reported Problem / Customer Fault Statement</p>
                    <p className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-medium text-slate-900 leading-relaxed">
                      "{dossier.job.reportedFault}"
                    </p>
                  </div>

                  {/* Assignment History */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                        <Wrench className="h-4 w-4 text-blue-600" />
                        <span>Technician Assignment Audit</span>
                      </div>
                      {dossier.assignment.currentTechnician && (
                        <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                          Final Assigned Tech: {dossier.assignment.currentTechnician.fullName}
                        </span>
                      )}
                    </div>

                    {dossier.assignment.auditHistory.length > 0 ? (
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                        {dossier.assignment.auditHistory.map((item, idx) => (
                          <div key={item.id || idx} className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs">
                            <div>
                              <span className="font-bold text-slate-900">
                                {item.assignedTechnician?.fullName || "Technician"}
                              </span>
                              {item.previousTechnician && (
                                <span className="text-slate-500 ml-1">
                                  (Reassigned from {item.previousTechnician.fullName})
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Assigned by {item.assignedBy?.fullName || "Staff"} on {formatDate(item.assignedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Assigned to {dossier.assignment.currentTechnician?.fullName || "Technician"} on {formatDate(dossier.assignment.assignedAt)}.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL DIAGNOSIS & STAFF NOTES */}
              {activeTab === "diagnosis" && (
                <div className="space-y-6">
                  {dossier.diagnosis ? (
                    <div className="space-y-4">
                      {/* Repairability Banner */}
                      {dossier.diagnosis.isUnrepairable ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
                          <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0" />
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider">Device Declared Unrepairable</h4>
                            <p className="text-xs text-rose-700 mt-0.5">
                              {dossier.diagnosis.unrepairableReason || "Technician determined this device cannot be restored to working condition economically."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                          <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider">Technical Diagnosis Complete — Device Repairable</h4>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              Diagnostic inspection completed by {dossier.diagnosis.completedBy?.fullName || "Technician"} on {formatDate(dossier.diagnosis.completedAt)}.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Diagnostic Findings */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Technical Findings & Component Inspection</p>
                        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {dossier.diagnosis.findings || "No findings recorded."}
                        </p>
                      </div>

                      {/* Recommended Work */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Recommended Repair Work</p>
                        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {dossier.diagnosis.recommendedWork || "No specific repair scope specified."}
                        </p>
                      </div>

                      {/* Staff-Only Internal Notes (Key Feature for SCRUM-129) */}
                      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-indigo-700" />
                          <p className="text-xs font-black uppercase tracking-wider text-indigo-900">
                            Technician Internal Notes (Restricted Staff Audit Access)
                          </p>
                        </div>
                        <p className="rounded-xl border border-indigo-200/80 bg-white p-4 text-xs font-medium text-indigo-950 leading-relaxed whitespace-pre-wrap">
                          {dossier.diagnosis.internalNotes || "No internal notes were logged by technician."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                      <p className="text-xs font-bold">No formal diagnosis record associated with this repair job.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ESTIMATES & AUTHORIZATION */}
              {activeTab === "estimates" && (
                <div className="space-y-6">
                  {dossier.estimates.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                      <p className="text-xs font-bold">No estimates were issued for this job.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dossier.estimates.map((est) => {
                        const isApproved = est.decision?.action === "APPROVED";
                        const isRejected = est.decision?.action === "REJECTED";

                        return (
                          <div
                            key={est.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-black text-white">
                                  Estimate Version {est.versionNumber}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Issued on {formatDate(est.issuedAt)} by {est.issuedBy?.fullName || "Owner/Staff"}
                                </span>
                              </div>

                              {/* Decision Badge */}
                              <div>
                                {isApproved && (
                                  <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Customer Authorised
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700">
                                    <XCircle className="h-3.5 w-3.5" />
                                    Customer Declined
                                  </span>
                                )}
                                {!isApproved && !isRejected && (
                                  <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    {est.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            {est.reasonForRevision && (
                              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                                <strong className="font-bold">Reason for Revision:</strong> {est.reasonForRevision}
                              </div>
                            )}

                            {/* Line Items Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                              <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  <tr>
                                    <th className="px-3.5 py-2">#</th>
                                    <th className="px-3.5 py-2">Type</th>
                                    <th className="px-3.5 py-2">Description</th>
                                    <th className="px-3.5 py-2 text-right">Qty</th>
                                    <th className="px-3.5 py-2 text-right">Unit Price</th>
                                    <th className="px-3.5 py-2 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {est.items.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                                      <td className="px-3.5 py-2 text-slate-400">{item.lineNumber}</td>
                                      <td className="px-3.5 py-2">
                                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                                          item.itemType === "part" ? "bg-cyan-100 text-cyan-800" : "bg-violet-100 text-violet-800"
                                        }`}>
                                          {item.itemType}
                                        </span>
                                      </td>
                                      <td className="px-3.5 py-2 font-medium text-slate-800">{item.partDescription}</td>
                                      <td className="px-3.5 py-2 text-right font-medium text-slate-700">{item.quantity}</td>
                                      <td className="px-3.5 py-2 text-right text-slate-600">{formatLkr(item.unitPriceMinor)}</td>
                                      <td className="px-3.5 py-2 text-right font-bold text-slate-900">{formatLkr(item.totalMinor)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="border-t border-slate-200 bg-slate-50 font-bold">
                                  <tr>
                                    <td colSpan={5} className="px-3.5 py-2.5 text-right text-slate-600">Total Authorized Amount:</td>
                                    <td className="px-3.5 py-2.5 text-right text-sm font-black text-slate-900">{formatLkr(est.totalMinor)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>

                            {/* Decision Note */}
                            {est.decision && (
                              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
                                <p>
                                  <strong className="font-bold text-slate-800">Customer Decision Recorded:</strong>{" "}
                                  {est.decision.action} on {formatDate(est.decision.decidedAt)}.
                                  {est.decision.notes && ` Notes: "${est.decision.notes}"`}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: WORKSHOP LOG & NOTES */}
              {activeTab === "workshop" && (
                <div className="space-y-6">
                  {/* Parts Hold Notice if applicable */}
                  {dossier.partsHold && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-900">
                        <Package className="h-4 w-4 text-orange-600" />
                        <span>Parts Hold Record</span>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <p className="text-orange-900/60 font-semibold">Component Ordered</p>
                          <p className="font-bold text-orange-950">{dossier.partsHold.requiredPart || "Special order component"}</p>
                        </div>
                        <div>
                          <p className="text-orange-900/60 font-semibold">Resolution Note</p>
                          <p className="font-bold text-orange-950">{dossier.partsHold.resolutionNote || "Resolved and fitted"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Workshop Log List */}
                  {dossier.workshopLogs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                      <p className="text-xs font-bold">No technician progress updates or workshop notes were recorded.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dossier.workshopLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`rounded-2xl border p-4 text-xs space-y-1.5 ${
                            log.isPublic
                              ? "border-sky-200 bg-sky-50/40"
                              : "border-slate-200 bg-slate-50/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                              log.isPublic ? "bg-sky-100 text-sky-800" : "bg-slate-200 text-slate-800"
                            }`}>
                              {log.isPublic ? "Customer Visible Update" : "Internal Tech Note"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatDate(log.createdAt)} • {log.recordedBy?.fullName || "Technician"}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 leading-relaxed">{log.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: QC & HANDOVER SIGNOFF */}
              {activeTab === "handover" && (
                <div className="space-y-6">
                  {/* Quality Control / Return Packaging Card */}
                  {dossier.outcome === "repaired" && dossier.qcCompletion ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Quality Control (QC) Completion Check</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-emerald-100 text-xs font-bold text-slate-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Reported Fault Resolved: {dossier.qcCompletion.faultResolved ? "YES" : "NO"}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-emerald-100 text-xs font-bold text-slate-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Functional Tests Passed: {dossier.qcCompletion.functionalTestPassed ? "YES" : "NO"}</span>
                        </div>
                      </div>
                      {dossier.qcCompletion.customerSummary && (
                        <div>
                          <p className="text-[11px] font-bold text-emerald-900 uppercase">Customer Repair Summary</p>
                          <p className="mt-1 rounded-xl bg-white border border-emerald-100 p-3 text-xs text-slate-800">
                            {dossier.qcCompletion.customerSummary}
                          </p>
                        </div>
                      )}
                      {dossier.qcCompletion.internalNotes && (
                        <div>
                          <p className="text-[11px] font-bold text-emerald-900 uppercase">Internal QC Verification Notes</p>
                          <p className="mt-1 rounded-xl bg-white border border-emerald-100 p-3 text-xs text-slate-800">
                            {dossier.qcCompletion.internalNotes}
                          </p>
                        </div>
                      )}
                      <p className="text-[11px] text-emerald-800">
                        Inspected & signed off by {dossier.qcCompletion.completedBy?.fullName || "Technician"} on {formatDate(dossier.qcCompletion.completedAt)}
                      </p>
                    </div>
                  ) : null}

                  {dossier.outcome === "unrepaired" && dossier.returnDetails ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                        <Package className="h-4 w-4 text-amber-600" />
                        <span>Unrepaired Return Readiness Packaging</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-amber-900/70 font-semibold">Return Reason</p>
                          <p className="font-extrabold text-amber-950 text-sm">{dossier.returnDetails.reason}</p>
                        </div>
                        {dossier.returnDetails.notes && (
                          <div>
                            <p className="text-amber-900/70 font-semibold">Packaging & Handover Instructions</p>
                            <p className="rounded-xl bg-white border border-amber-200 p-3 font-medium text-amber-950">
                              {dossier.returnDetails.notes}
                            </p>
                          </div>
                        )}
                        <p className="text-[11px] text-amber-800">
                          Packaged for customer return by {dossier.returnDetails.returnedBy?.fullName || "Staff"} on {formatDate(dossier.returnDetails.returnedAt)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Customer Handover Signoff Record */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <span>Customer Handover & Closure Signoff</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-slate-200 text-xs font-bold text-slate-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Customer Identity Verified: {dossier.handover.customerIdentityConfirmed ? "CONFIRMED" : "YES"}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-slate-200 text-xs font-bold text-slate-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Device Physical Handover: {dossier.handover.deviceHandedOver ? "CONFIRMED" : "YES"}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div>
                          <p className="text-slate-400 font-semibold">Handed Over Timestamp</p>
                          <p className="font-extrabold text-slate-900">{formatDate(dossier.handover.collectedAt)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold">Releasing Staff Member</p>
                          <p className="font-extrabold text-slate-900">{dossier.handover.collectedBy?.fullName || "Owner / Staff"}</p>
                        </div>
                      </div>
                      {dossier.handover.notes && (
                        <div className="border-t border-slate-100 pt-2">
                          <p className="text-slate-400 font-semibold">Handover / Customer Reception Notes</p>
                          <p className="font-medium text-slate-800 mt-0.5">{dossier.handover.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CHRONOLOGICAL EVENT LEDGER */}
              {activeTab === "ledger" && (
                <div className="space-y-4">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                      {[
                        { id: "all", label: "All Audit Events" },
                        { id: "intake", label: "Intake" },
                        { id: "assignment", label: "Assignment" },
                        { id: "diagnosis", label: "Diagnosis" },
                        { id: "estimate", label: "Estimates" },
                        { id: "workshop", label: "Workshop" },
                        { id: "qc", label: "QC / Return" },
                        { id: "handover", label: "Handover" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setLedgerCategoryFilter(cat.id)}
                          className={`rounded-lg px-2.5 py-1 transition ${
                            ledgerCategoryFilter === cat.id
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      Showing {filteredLedger.length} events
                    </div>
                  </div>

                  {/* Chronological Timeline */}
                  <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                    {filteredLedger.map((event, idx) => (
                      <div key={event.id || idx} className="relative group">
                        {/* Dot on timeline */}
                        <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow" />

                        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700">
                                {event.badge?.label || event.eventType}
                              </span>
                              <h4 className="text-xs font-black text-slate-900">{event.title}</h4>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-700 leading-relaxed">
                            {event.description}
                          </p>

                          {event.actor && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 pt-1">
                              <UserRound className="h-3 w-3 text-slate-400" />
                              <span>Actor: {event.actor.fullName} ({event.actor.role || "User"})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Immutable closed service audit record. No further mutations permitted.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
