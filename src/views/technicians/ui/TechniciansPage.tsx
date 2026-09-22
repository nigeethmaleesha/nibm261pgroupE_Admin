"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, Plus, RefreshCw, Search, UserCheck, UserX } from "lucide-react";
import { getTechnicians, toggleTechnicianActive } from "@/src/shared/api/technicians.api";
import { ApiError } from "@/src/shared/api/http";
import type { InternalUser } from "@/src/shared/types/internal";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { useToast } from "@/src/shared/ui/ToastProvider";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { AddTechnicianModal } from "@/src/widgets/technicians/ui/AddTechnicianModal";

type Filter = "all" | "active" | "disabled";

export function TechniciansPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [technicians, setTechnicians] = useState<InternalUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await getTechnicians(filter);
      setTechnicians(response.technicians);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to load technicians.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const visible = technicians.filter((technician) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [technician.fullName, technician.email, technician.contactNumber]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const handleToggle = async (technician: InternalUser) => {
    if (togglingId) return;
    try {
      setTogglingId(technician.id);
      const response = await toggleTechnicianActive(technician.id);
      toast.success(response.message);
      await load();
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Unable to update technician status.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <InternalDashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Owner / Staff</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">Technicians</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Create technician accounts and control active access.</p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-extrabold text-white shadow-[0_9px_22px_rgba(37,99,235,0.20)] transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add technician
          </button>
        </div>

        {error && <InlineAlert>{error}</InlineAlert>}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="relative w-full sm:max-w-[330px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search technician"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as Filter)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 outline-none focus:border-blue-400"
              >
                <option value="all">All verified</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <button type="button" onClick={() => void load()} disabled={loading} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-extrabold uppercase tracking-[0.11em] text-slate-400">
                  <th className="px-5 py-3">Technician</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {!loading && visible.map((technician) => (
                  <tr key={technician.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-extrabold text-slate-900">{technician.fullName}</p>
                      <p className="mt-0.5 text-[12px] font-medium text-slate-500">{technician.email}</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-slate-600">{technician.contactNumber}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${technician.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${technician.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {technician.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={togglingId === technician.id}
                        onClick={() => void handleToggle(technician)}
                        className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3.5 text-[12px] font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${technician.isActive ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                      >
                        {technician.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        {togglingId === technician.id ? "Updating..." : technician.isActive ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="flex min-h-52 items-center justify-center text-sm font-semibold text-slate-400">Loading technicians...</div>
          )}
          {!loading && visible.length === 0 && (
            <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
              <CircleAlert className="h-7 w-7 text-slate-300" />
              <p className="mt-3 text-sm font-extrabold text-slate-700">No technicians found</p>
              <p className="mt-1 text-[12px] font-medium text-slate-400">Verified technicians matching this filter will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <AddTechnicianModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          void load();
        }}
      />
    </InternalDashboardShell>
  );
}
