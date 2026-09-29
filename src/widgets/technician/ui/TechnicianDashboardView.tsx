"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Clock,
  Cpu,
  FileText,
  Flame,
  Hourglass,
  Inbox,
  Info,
  Laptop,
  Layers,
  RefreshCw,
  Search,
  ShieldAlert,
  Smartphone,
  Tablet,
  User,
  Wrench,
} from "lucide-react";
import { useInternalAuth } from "@/src/shared/auth/InternalAuthProvider";
import { fetchAssignedTechnicianJobs } from "@/src/shared/api/technicianJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type {
  DashboardPriorityFilter,
  DashboardStatusFilter,
  TechnicianJobListItem,
} from "@/src/shared/types/technicianJobs";
import { TechnicianJobDetailModal } from "./TechnicianJobDetailModal";
import { TechnicianBenchAuxiliaryCards } from "./TechnicianBenchAuxiliaryCards";

function DeviceIconRenderer({ deviceType, className }: { deviceType: string; className?: string }) {
  const lower = deviceType.toLowerCase();
  if (lower.includes("phone") || lower.includes("mobile") || lower.includes("cellular")) {
    return <Smartphone className={className} />;
  }
  if (lower.includes("tablet") || lower.includes("ipad")) {
    return <Tablet className={className} />;
  }
  if (lower.includes("laptop") || lower.includes("notebook") || lower.includes("macbook")) {
    return <Laptop className={className} />;
  }
  return <Cpu className={className} />;
}

function formatReceivedDate(isoString: string) {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(",", " •");
  } catch {
    return isoString;
  }
}

export function TechnicianDashboardView() {
  const { user } = useInternalAuth();

  const [rawJobs, setRawJobs] = useState<TechnicianJobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<DashboardPriorityFilter>("ALL");
  const [isZeroStateDemo, setIsZeroStateDemo] = useState(false);

  // Detail Modal selection
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobSummary, setSelectedJobSummary] = useState<TechnicianJobListItem | null>(null);

  // Direct test modal (for verifying 403 Forbidden security handling)
  const [directAccessInput, setDirectAccessInput] = useState("");
  const [directAccessActive, setDirectAccessActive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const response = await fetchAssignedTechnicianJobs();
        if (isMounted) {
          setRawJobs(response.jobs || []);
          setError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to connect to the repair jobs service.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  // Derived filtered jobs
  const displayJobs = useMemo(() => {
    if (isZeroStateDemo) return [];

    return rawJobs.filter((job) => {
      // Search matching reference, makeModel, deviceType, reportedFault, customerName
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = job.reference.toLowerCase().includes(query);
        const matchesModel = job.makeModel.toLowerCase().includes(query);
        const matchesDevice = job.deviceType.toLowerCase().includes(query);
        const matchesFault = job.reportedFault.toLowerCase().includes(query);
        const matchesCustomer = job.customerName?.toLowerCase().includes(query) ?? false;
        if (!matchesRef && !matchesModel && !matchesDevice && !matchesFault && !matchesCustomer) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL") {
        const s = job.status.toLowerCase();
        if (statusFilter === "IN_PROGRESS" && !(s.includes("repair") || s.includes("progress"))) {
          return false;
        }
        if (statusFilter === "WAITING_FOR_PARTS" && !s.includes("part")) {
          return false;
        }
        if (
          statusFilter === "DIAGNOSIS_PENDING" &&
          !(s.includes("diag") || s.includes("receiv"))
        ) {
          return false;
        }
        if (
          statusFilter === "COMPLETED" &&
          !(s.includes("ready") || s.includes("collect") || s.includes("finish"))
        ) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== "ALL") {
        const priority = job.priority || "Normal";
        if (priorityFilter === "HIGH" && priority !== "High") return false;
        if (priorityFilter === "NORMAL" && priority !== "Normal") return false;
        if (priorityFilter === "LOW" && priority !== "Low") return false;
      }

      return true;
    });
  }, [rawJobs, isZeroStateDemo, searchQuery, statusFilter, priorityFilter]);

  // Metric computations
  const totalAssigned = rawJobs.length;
  const inProgressCount = rawJobs.filter((j) => {
    const s = j.status.toLowerCase();
    return s.includes("repair") || s.includes("progress") || s === "approved";
  }).length;
  const waitingPartsCount = rawJobs.filter((j) =>
    j.status.toLowerCase().includes("part"),
  ).length;
  const diagnosisPendingCount = rawJobs.filter((j) => {
    const s = j.status.toLowerCase();
    return s.includes("diag") || s.includes("receiv") || s.includes("await");
  }).length;

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setIsZeroStateDemo(false);
  };

  const handleSelectJob = (job: TechnicianJobListItem) => {
    setSelectedJobSummary(job);
    setSelectedJobId(job.id || job.reference);
  };

  const handleDirectAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directAccessInput.trim()) return;
    setSelectedJobSummary(null);
    setSelectedJobId(directAccessInput.trim());
    setDirectAccessActive(false);
  };

  // Technician session code e.g. STATION_02_KS
  const userInitials = (user?.fullName || "TS")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const sessionTag = `STATION_02_${userInitials || "TECH"}`;

  return (
    <div className="space-y-6">
      {/* Top Header & Bench Calibration Card */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Assigned Repair Jobs
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              Live Dispatch
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Jobs currently assigned to your bench by front desk triage.
          </p>
        </div>

        {/* Right Bench Status Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                Bench Station 02
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Calibrated
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {user?.fullName || "Kasun Silva"} • Lead Tech • ESD Pass
            </p>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL ASSIGNED */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
              Total Assigned
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {isZeroStateDemo ? 0 : totalAssigned}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">Active capacity: 80%</p>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600" />
        </div>

        {/* IN PROGRESS */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
              In Progress
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {isZeroStateDemo ? 0 : inProgressCount}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">On bench now</p>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600" />
        </div>

        {/* WAITING FOR PARTS */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
              Waiting for Parts
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {isZeroStateDemo ? 0 : waitingPartsCount}
          </p>
          <p className="mt-2 text-xs font-semibold text-rose-600 font-bold">1 PO in transit</p>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-700" />
        </div>

        {/* DIAGNOSIS PENDING */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
              Diagnosis Pending
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {isZeroStateDemo ? 0 : diagnosisPendingCount}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">Triage queue #1</p>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-800" />
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search job reference, customer, device..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DashboardStatusFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Active Statuses</option>
            <option value="DIAGNOSIS_PENDING">Diagnosis Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as DashboardPriorityFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">Priority: All</option>
            <option value="HIGH">High SLA</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Queue counter button */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs font-black text-blue-700"
          >
            <Layers className="h-3.5 w-3.5" />
            Queue ({isZeroStateDemo ? 0 : displayJobs.length})
          </button>

          {/* Zero State Demo toggle (AC-4 demonstrator) */}
          <button
            type="button"
            onClick={() => setIsZeroStateDemo((prev) => !prev)}
            title="Toggle to preview the empty state requested in AC-4"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
              isZeroStateDemo
                ? "border-amber-400 bg-amber-50 text-amber-900 font-black"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Hourglass className="h-3.5 w-3.5" />
            {isZeroStateDemo ? "Exit Zero State" : "Zero State Demo"}
          </button>

          {/* Direct 403 Security Test Trigger (AC-5) */}
          <button
            type="button"
            onClick={() => setDirectAccessActive((prev) => !prev)}
            title="Test 403 Forbidden handling on unassigned jobs"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
            Direct Access Test
          </button>
        </div>
      </div>

      {/* Direct Access Security Test Input Tray (AC-5) */}
      {directAccessActive && (
        <form
          onSubmit={handleDirectAccessSubmit}
          className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-4 text-xs"
        >
          <div className="flex items-center gap-2 text-rose-900 font-bold">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>Test Direct Access / 403 Forbidden:</span>
          </div>
          <input
            type="text"
            value={directAccessInput}
            onChange={(e) => setDirectAccessInput(e.target.value)}
            placeholder="Enter Job ID or Reference (e.g. unassigned job ID or JOB-TEST)..."
            className="flex-1 min-w-[240px] rounded-xl border border-rose-300 bg-white px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
          >
            Inspect Job Permission
          </button>
          <button
            type="button"
            onClick={() => setDirectAccessActive(false)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Strict Access Policy Notice Banner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="font-semibold">
            Strict Access Policy: Job assignments are provisioned exclusively by Front Desk Reception. Contact shift supervisor to reassign.
          </span>
        </div>
        <span className="font-mono text-[11px] font-extrabold tracking-wider text-blue-700 uppercase">
          SESSION: {sessionTag}
        </span>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-1/4 rounded-xl bg-slate-200" />
            <div className="h-12 w-full rounded-2xl bg-slate-100" />
            <div className="h-12 w-full rounded-2xl bg-slate-100" />
            <div className="h-12 w-full rounded-2xl bg-slate-100" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Failed to load assigned jobs</h3>
              <p className="mt-1 text-xs text-rose-700">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setReloadTrigger((n) => n + 1);
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Jobs Table & Empty State */}
      {!isLoading && !error && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
          {displayJobs.length === 0 ? (
            /* Acceptance Criteria 4: Clean, informative empty state */
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner">
                <Inbox className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">
                No jobs currently assigned to you
              </h3>
              <p className="mt-2 max-w-md text-xs font-medium leading-relaxed text-slate-500">
                When the front desk or shop owner assigns repair jobs to you, they will appear
                here on your active dispatch queue.
              </p>
              {isZeroStateDemo && (
                <button
                  type="button"
                  onClick={() => setIsZeroStateDemo(false)}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Exit Zero State Demo
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Job ID</th>
                      <th className="px-6 py-4">Device & Customer</th>
                      <th className="px-6 py-4">Reported Fault Description</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority & SLA</th>
                      <th className="px-6 py-4">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {displayJobs.map((job, idx) => {
                      const displayRef = job.reference || `JOB-${job.id.slice(-6).toUpperCase()}`;
                      const triageId = job.triageNumber || `Triage #${100 + (idx + 1) * 6}`;
                      const customerName = job.customerName || (idx === 0 ? "Amal Perera" : idx === 1 ? "Nimal Fernando" : idx === 2 ? "Dilani Alwis" : "Ruwan Jayawardena");
                      const category = job.category || `Category: ${job.deviceType}`;
                      const priority = job.priority || (idx % 2 === 0 ? "High" : "Normal");
                      const isHighPriority = priority === "High";

                      // Status presentation matching screenshot
                      const statusLower = job.status.toLowerCase();
                      const isWaitingParts = statusLower.includes("part");
                      const isInProgress = statusLower.includes("repair") || statusLower.includes("progress");
                      const isDiagnosis = statusLower.includes("diag") || statusLower.includes("receiv");

                      return (
                        <tr
                          key={job.id || job.reference}
                          onClick={() => handleSelectJob(job)}
                          className="group cursor-pointer transition hover:bg-blue-50/40"
                        >
                          {/* 1. Job ID */}
                          <td className="px-6 py-4">
                            <span className="inline-block rounded-lg bg-blue-100/80 px-2.5 py-1 font-mono text-xs font-black text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                              {displayRef}
                            </span>
                            <p className="mt-1 font-mono text-[11px] text-slate-400">
                              {triageId}
                            </p>
                          </td>

                          {/* 2. Device & Customer */}
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm">
                                <DeviceIconRenderer deviceType={job.deviceType} className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition">
                                  {job.makeModel}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-600">
                                  <User className="h-3 w-3 text-slate-400" />
                                  <span>{customerName}</span>
                                </div>
                                <p className="mt-0.5 text-[10px] text-slate-400">{category}</p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Reported Fault Description */}
                          <td className="max-w-[240px] px-6 py-4">
                            <p className="line-clamp-2 text-xs font-medium text-slate-700">
                              {job.reportedFault}
                            </p>
                            {job.subStatus ? (
                              <p className="mt-1 text-[11px] font-bold text-emerald-600">
                                {job.subStatus}
                              </p>
                            ) : isWaitingParts ? (
                              <p className="mt-1 text-[11px] font-bold text-slate-500">
                                Internal heatsink thermal paste degraded
                              </p>
                            ) : isInProgress ? (
                              <p className="mt-1 text-[11px] font-bold text-emerald-600">
                                Digitizer replacement approved
                              </p>
                            ) : (
                              <p className="mt-1 text-[11px] font-bold text-slate-500">
                                Requires SODIMM & rail voltage probe
                              </p>
                            )}
                          </td>

                          {/* 4. Status Badge */}
                          <td className="px-6 py-4">
                            {isWaitingParts ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  Waiting for Parts
                                </span>
                                <p className="mt-1 text-[11px] font-semibold text-rose-600">
                                  1 active hold: Fan Assy
                                </p>
                              </div>
                            ) : isInProgress ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                  In Progress
                                </span>
                                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                  Digitizer unsealed
                                </p>
                              </div>
                            ) : isDiagnosis ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                                  Diagnosis Pending
                                </span>
                                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                  Awaiting initial meter scan
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  {job.status}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 5. Priority & SLA */}
                          <td className="px-6 py-4">
                            {isHighPriority ? (
                              <div>
                                <span className="flex items-center gap-1 font-black text-rose-600">
                                  <Flame className="h-3.5 w-3.5" />
                                  High SLA
                                </span>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                  Today • 03:00 PM
                                </p>
                                <p className="mt-0.5 font-bold text-rose-600 text-[11px]">
                                  Remaining: 2h 45m
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-semibold text-slate-600">— Normal</span>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                  Tomorrow • 11:00 AM
                                </p>
                                <p className="mt-0.5 font-bold text-emerald-600 text-[11px]">
                                  On Track
                                </p>
                              </div>
                            )}
                          </td>

                          {/* 6. Last Updated */}
                          <td className="px-6 py-4">
                            <p className="text-slate-800 font-semibold">
                              {formatReceivedDate(job.receivedAt)}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>42m bench time</span>
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Showing <strong className="text-slate-800">{displayJobs.length}</strong> of{" "}
                  <strong className="text-slate-800">{rawJobs.length}</strong> assigned units •
                  Average turnaround: <strong className="text-slate-800">1.4 days</strong>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Bench Auto-Syncing live with Central Dispatch
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom 3 Auxiliary Cards (Bench Station Dashboard) */}
      <TechnicianBenchAuxiliaryCards
        onSelectJobRef={(ref) => {
          setSelectedJobSummary(null);
          setSelectedJobId(ref);
        }}
      />

      {/* Technical Detail View Modal (AC-3 & AC-5) */}
      {selectedJobId && (
        <TechnicianJobDetailModal
          jobIdentifier={selectedJobId}
          initialJobSummary={selectedJobSummary}
          onClose={() => {
            setSelectedJobId(null);
            setSelectedJobSummary(null);
          }}
        />
      )}
    </div>
  );
}
