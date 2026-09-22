"use client";

import { BadgeCheck, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useInternalAuth } from "@/src/shared/auth/InternalAuthProvider";
import { InternalDashboardShell } from "@/src/widgets/dashboard/ui/InternalDashboardShell";

export function InternalProfilePage() {
  const { user } = useInternalAuth();
  if (!user) return null;

  const roleLabel = user.role === "owner_staff" ? "Owner / Staff" : "Technician";

  const rows = [
    { label: "Full name", value: user.fullName, icon: UserRound },
    { label: "Email", value: user.email, icon: Mail },
    { label: "Contact number", value: user.contactNumber, icon: Phone },
    { label: "Role", value: roleLabel, icon: ShieldCheck },
  ];

  return (
    <InternalDashboardShell>
      <div className="mx-auto max-w-[820px] space-y-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Account</p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">My profile</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Your verified RepairFlow team account information.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black">{user.fullName}</h2>
                <p className="mt-1 text-[12px] font-bold text-blue-100">{roleLabel}</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      <Icon className="h-4 w-4 text-blue-500" />
                      {row.label}
                    </div>
                    <p className="mt-2 break-words text-[14px] font-extrabold text-slate-800">{row.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5 text-[13px] font-bold text-emerald-800">
              <BadgeCheck className="h-5 w-5 shrink-0" />
              Email verified · Account {user.isActive ? "active" : "disabled"}
            </div>
          </div>
        </div>
      </div>
    </InternalDashboardShell>
  );
}
