"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eraser,
  LoaderCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { ApiError } from "@/src/shared/api/http";
import {
  getRepairJobDetail,
  searchRepairJobs,
} from "@/src/shared/api/repairJobs.api";
import type {
  RepairJob,
  RepairJobSearchItem,
} from "@/src/shared/types/repairJobs";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { RepairJobDetailPanel } from "@/src/widgets/repair-jobs/ui/RepairJobDetailPanel";
import { RepairJobSearchList } from "@/src/widgets/repair-jobs/ui/RepairJobSearchList";

const FILTERS = [
  "ALL",
  "Received",
  "Diagnosing",
  "Awaiting Approval",
  "Approved",
  "In Repair",
  "Waiting for Parts",
  "Ready for Collection",
  "Collected",
] as const;

export function RepairJobSearchPage() {
  const [input, setInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [jobs, setJobs] = useState<RepairJobSearchItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [refreshListToken, setRefreshListToken] = useState(0);
  const [refreshDetailToken, setRefreshDetailToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(input.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    let mounted = true;
    setListLoading(true);
    setListError("");

    searchRepairJobs(debouncedQuery, 60)
      .then((response) => {
        if (!mounted) return;
        setJobs(response.jobs || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setJobs([]);
        setListError(
          err instanceof ApiError
            ? err.message
            : "Unable to load repair jobs.",
        );
      })
      .finally(() => {
        if (mounted) setListLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [debouncedQuery, refreshListToken]);

  useEffect(() => {
    if (!selectedIdentifier) {
      setSelectedJob(null);
      setDetailError("");
      return;
    }

    let mounted = true;
    setDetailLoading(true);
    setDetailError("");

    getRepairJobDetail(selectedIdentifier)
      .then((response) => {
        if (!mounted) return;
        setSelectedJob(response.job);
      })
      .catch((err) => {
        if (!mounted) return;
        setSelectedJob(null);
        setDetailError(
          err instanceof ApiError
            ? err.message
            : "Unable to open the selected repair job.",
        );
      })
      .finally(() => {
        if (mounted) setDetailLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [refreshDetailToken, selectedIdentifier]);

  const visibleJobs = useMemo(() => {
    if (statusFilter === "ALL") return jobs;
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const filterActive = Boolean(input.trim()) || statusFilter !== "ALL";

  const selectJob = (job: RepairJobSearchItem) => {
    setSelectedIdentifier(job.id);
    setSuccessMessage("");
  };

  const clearFilters = () => {
    setInput("");
    setStatusFilter("ALL");
  };

  const handleAssigned = (updatedJob: RepairJob, message: string) => {
    setSelectedJob(updatedJob);
    setSuccessMessage(message);
    setJobs((current) =>
      current.map((item) =>
        item.id === updatedJob.id
          ? {
              ...item,
              assignedTechnician:
                updatedJob.assignment?.technician ||
                updatedJob.assignedTechnician ||
                null,
              assignedAt:
                updatedJob.assignment?.assignedAt ||
                updatedJob.assignedAt ||
                null,
              revision: updatedJob.revision ?? item.revision,
              updatedAt: updatedJob.updatedAt,
            }
          : item,
      ),
    );
    setRefreshListToken((value) => value + 1);
  };

  return (
    <InternalDashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.20)]">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                  SCRUM-10 + SCRUM-11
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  Repair Job Search & Assignment
                </h1>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                  Search the workshop by job reference, customer name, or contact number. Open the saved intake, review the current state, and assign an active technician.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[11px] font-extrabold text-emerald-700">
            <ShieldCheck className="h-4 w-4" /> Owner / Staff only
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_38px_rgba(15,23,42,0.045)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search job reference, customer name, or contact number..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-[13px] font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              {input !== debouncedQuery && (
                <LoaderCircle className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />
              )}
            </div>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!filterActive}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Eraser className="h-4 w-4" /> Clear filters
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <SlidersHorizontal className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const active = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
                    }`}
                  >
                    {filter === "ALL" ? "All jobs" : filter}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {listError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            {listError}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(330px,0.85fr)_minmax(520px,1.35fr)]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">Repair jobs</h2>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  {listLoading ? "Loading..." : `${visibleJobs.length} matching result${visibleJobs.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            <div className="max-h-[calc(100vh-245px)] overflow-y-auto pr-1">
              <RepairJobSearchList
                jobs={visibleJobs}
                selectedId={selectedJob?.id || selectedIdentifier}
                loading={listLoading}
                query={debouncedQuery}
                onSelect={selectJob}
              />
            </div>
          </section>

          <section>
            <RepairJobDetailPanel
              job={selectedJob}
              loading={detailLoading}
              error={detailError}
              successMessage={successMessage}
              onRetry={() => setRefreshDetailToken((value) => value + 1)}
              onAssigned={handleAssigned}
            />
          </section>
        </div>
      </div>
    </InternalDashboardShell>
  );
}
