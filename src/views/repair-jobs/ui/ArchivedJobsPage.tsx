"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  History,
  Lock,
  RotateCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { searchArchivedJobs } from "@/src/shared/api/archive.api";
import type {
  ArchivedJobSummary,
  ArchiveFilterParams,
} from "@/src/shared/types/archive";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { ArchiveSearchFilters } from "@/src/widgets/archive/ui/ArchiveSearchFilters";
import { ArchivedJobsList } from "@/src/widgets/archive/ui/ArchivedJobsList";
import { JobDossierModal } from "@/src/widgets/archive/ui/JobDossierModal";

export function ArchivedJobsPage() {
  const [filters, setFilters] = useState<ArchiveFilterParams>({
    query: "",
    outcome: "all",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 15,
  });

  const [jobs, setJobs] = useState<ArchivedJobSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected job for Dossier modal view
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filters.query || "");
    }, 300);

    return () => clearTimeout(handler);
  }, [filters.query]);

  // Fetch archived jobs whenever filters or debounced query changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    searchArchivedJobs({
      ...filters,
      query: debouncedQuery,
    })
      .then((res) => {
        if (isMounted) {
          setJobs(res.jobs);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || "Failed to search closed repair jobs.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    debouncedQuery,
    filters.outcome,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit,
  ]);

  const handleFilterChange = (newFilters: Partial<ArchiveFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: "",
      outcome: "all",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 15,
    });
  };

  return (
    <InternalDashboardShell>
      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 p-1.5 text-blue-700">
                <Archive className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Closed Jobs Archive
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Search and inspect immutable service records, full audit dossiers, technical notes, and customer handover signoffs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/repair-jobs"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Active Repair Jobs</span>
            </Link>
          </div>
        </div>

        {/* Search & Date Filter Card (SCRUM-127) */}
        <ArchiveSearchFilters
          filters={filters}
          totalResults={total}
          loading={loading}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        {/* Archived Jobs Result List */}
        <ArchivedJobsList
          jobs={jobs}
          loading={loading}
          page={filters.page || 1}
          totalPages={totalPages}
          total={total}
          onPageChange={(newPage) => handleFilterChange({ page: newPage })}
          onSelectJob={(id) => setSelectedIdentifier(id)}
        />

        {/* Master Read-Only Job Dossier Modal (SCRUM-128) */}
        {selectedIdentifier && (
          <JobDossierModal
            jobIdentifier={selectedIdentifier}
            onClose={() => setSelectedIdentifier(null)}
          />
        )}
      </div>
    </InternalDashboardShell>
  );
}
