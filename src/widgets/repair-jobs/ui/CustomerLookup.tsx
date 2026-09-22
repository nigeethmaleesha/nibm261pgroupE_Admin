"use client";

import { Search, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { lookupRegisteredCustomers } from "@/src/shared/api/repairJobs.api";
import { ApiError } from "@/src/shared/api/http";
import type { RepairCustomer } from "@/src/shared/types/repairJobs";

export function CustomerLookup({
  selectedCustomer,
  onSelect,
  disabled = false,
}: {
  selectedCustomer: RepairCustomer | null;
  onSelect: (customer: RepairCustomer | null) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<RepairCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const normalized = query.trim();
    if (selectedCustomer || normalized.length < 2) {
      setCustomers([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await lookupRegisteredCustomers(normalized, 10);
        if (!controller.signal.aborted) setCustomers(response.customers);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setCustomers([]);
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "Unable to search registered customers.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, selectedCustomer]);

  if (selectedCustomer) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-slate-950">{selectedCustomer.fullName}</p>
              <p className="mt-1 truncate text-[12px] font-semibold text-slate-600">{selectedCustomer.email}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-500">{selectedCustomer.contactNumber}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onSelect(null);
              setQuery("");
              setCustomers([]);
            }}
            className="rounded-xl border border-blue-200 bg-white p-2 text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Change customer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          disabled={disabled}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by customer name, email or contact number"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[13px] font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      <p className="mt-2 text-[11px] font-medium text-slate-400">
        Type at least 2 characters. Only active, verified registered customers are returned.
      </p>

      {loading && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[12px] font-semibold text-slate-500">
          Searching customers...
        </div>
      )}

      {!loading && error && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && query.trim().length >= 2 && customers.length === 0 && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-500">
          No registered customers match this search.
        </div>
      )}

      {!loading && customers.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
          {customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                onSelect(customer);
                setCustomers([]);
              }}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-0 hover:bg-blue-50/60 disabled:cursor-not-allowed"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-extrabold text-slate-900">{customer.fullName}</p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                  {customer.email} · {customer.contactNumber}
                </p>
              </div>
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-blue-700">
                Select
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
