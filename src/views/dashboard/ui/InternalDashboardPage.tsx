"use client";

import Link from "next/link";
import { ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { useInternalAuth } from "@/src/shared/auth/InternalAuthProvider";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";
import { TechnicianDashboardView } from "@/src/widgets/technician/ui/TechnicianDashboardView";

export function InternalDashboardPage() {
  const { user } = useInternalAuth();
  if (!user) return null;

  const isOwner = user.role === "owner_staff";

  if (!isOwner) {
    return (
      <InternalDashboardShell>
        <TechnicianDashboardView />
      </InternalDashboardShell>
    );
  }

  return (
    <InternalDashboardShell>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
            Owner / Staff
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
            Welcome, {user.fullName}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Your RepairFlow workspace is ready.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.11em] text-slate-400">Account</p>
            <p className="mt-1 text-lg font-black text-slate-900">Active & verified</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <UsersRound className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.11em] text-slate-400">Access role</p>
            <p className="mt-1 text-lg font-black text-slate-900">Owner / Staff</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <UserRound className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.11em] text-slate-400">Profile</p>
            <p className="mt-1 truncate text-lg font-black text-slate-900">{user.email}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.05)] sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-[-0.025em] text-slate-950">
                Staff management
              </h2>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Create technician accounts, review active technicians, and control account access.
              </p>
            </div>
            <Link
              href="/technicians"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-[13px] font-extrabold text-white shadow-[0_9px_22px_rgba(37,99,235,0.20)] transition hover:bg-blue-700"
            >
              Manage technicians
            </Link>
          </div>
        </div>
      </div>
    </InternalDashboardShell>
  );
}

