"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardPlus,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useInternalAuth } from "@/src/shared/auth/InternalAuthProvider";
import { BrandLogo } from "@/src/shared/ui/BrandLogo";

const navBase = "flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition";

export function InternalDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useInternalAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const isOwner = user.role === "owner_staff";
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/repair-jobs/new", label: "Register Repair Job", icon: ClipboardPlus, show: isOwner },
    { href: "/repair-jobs/estimate", label: "Create Estimate", icon: ReceiptText, show: isOwner },
    { href: "/technicians", label: "Technicians", icon: UsersRound, show: isOwner },
    { href: "/profile", label: "Profile", icon: UserRound, show: true },
  ].filter((item) => item.show);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    router.replace("/staff/login");
  };

  const SidebarContent = () => (
    <>
      <div className="border-b border-slate-100 px-5 py-5">
        <BrandLogo />
      </div>

      <div className="px-4 py-4">
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]">
              {isOwner ? <UsersRound className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-extrabold text-slate-900">{user.fullName}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.11em] text-blue-600">
                {isOwner ? "Owner / Staff" : "Technician"}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`${navBase} ${
                  active
                    ? "bg-blue-600 text-white shadow-[0_9px_24px_rgba(37,99,235,0.20)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f8fd] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-slate-200/80 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(84vw,300px)] flex-col bg-white shadow-2xl">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-3 top-3 z-10 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600">RepairFlow</p>
              <p className="text-sm font-extrabold text-slate-900">Staff Workspace</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure session
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
