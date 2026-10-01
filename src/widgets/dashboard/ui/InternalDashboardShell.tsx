"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  ChevronRight,
  ClipboardPlus,
  LayoutDashboard,
  LogOut,
  Menu,
  Power,
  ReceiptText,
  Search,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useInternalAuth } from "@/src/shared/auth/InternalAuthProvider";
import { BrandLogo } from "@/src/shared/ui/BrandLogo";

interface SidebarProps {
  pathname: string;
  user: { fullName: string; role: string };
  loggingOut: boolean;
  onLogout: () => void;
  onNavigate: () => void;
}

function TechnicianSidebar({
  pathname,
  user,
  loggingOut,
  onLogout,
  onNavigate,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-[#0b1329] text-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-800/80 px-5 py-5">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
          <Wrench className="h-5 w-5 text-white" strokeWidth={2.4} />
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-white">RepairFlow</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        {/* WORK Section */}
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Work
          </p>
          <div className="mt-2 space-y-1">
            <Link
              href="/dashboard"
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                pathname === "/dashboard"
                  ? "bg-blue-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)]"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <Wrench className="h-4 w-4" />
              Assigned Repair Jobs
            </Link>

            <a
              href="#parts"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
            >
              <Boxes className="h-4 w-4" />
              Parts & Line Items
            </a>
          </div>
        </div>

        {/* ACCOUNT Section */}
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Account
          </p>
          <div className="mt-2 space-y-1">
            <Link
              href="/profile"
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                pathname === "/profile"
                  ? "bg-blue-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)]"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <UserRound className="h-4 w-4" />
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom User Card */}
      <div className="border-t border-slate-800/80 p-3.5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black text-white text-xs">
              {user.fullName.slice(0, 2).toUpperCase()}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0b1329] bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold text-white">{user.fullName}</p>
              <p className="text-[10px] font-semibold text-slate-400">Bench Tech #02</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/80 py-2 text-xs font-bold text-slate-300 transition hover:bg-rose-950/40 hover:text-rose-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OwnerSidebar({
  pathname,
  user,
  loggingOut,
  onLogout,
  onNavigate,
}: SidebarProps) {
  const ownerNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/repair-jobs", label: "Repair Jobs", icon: Search },
    { href: "/repair-jobs/new", label: "Register Repair Job", icon: ClipboardPlus },
    { href: "/repair-jobs/estimate", label: "Create Estimate", icon: ReceiptText },
    { href: "/technicians", label: "Technicians", icon: UsersRound },
    { href: "/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <>
      <div className="border-b border-slate-100 px-5 py-5">
        <BrandLogo />
      </div>

      <div className="px-4 py-4">
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]">
              <UsersRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-extrabold text-slate-900">{user.fullName}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.11em] text-blue-600">
                Owner / Staff
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {ownerNavItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/repair-jobs" &&
                pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition ${
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
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </>
  );
}

export function InternalDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useInternalAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const isOwner = user.role === "owner_staff";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    router.replace("/staff/login");
  };

  const shortName = user.fullName.split(" ")[0] || "User";
  const sidebarProps: SidebarProps = {
    pathname,
    user,
    loggingOut,
    onLogout: handleLogout,
    onNavigate: () => setMobileOpen(false),
  };

  return (
    <div className="min-h-screen bg-[#f5f8fd] text-slate-950">
      {/* Sidebar Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col border-r lg:flex ${
          isOwner ? "border-slate-200/80 bg-white" : "border-slate-900 bg-[#0b1329]"
        }`}
      >
        {isOwner ? (
          <OwnerSidebar {...sidebarProps} />
        ) : (
          <TechnicianSidebar {...sidebarProps} />
        )}
      </aside>

      {/* Sidebar Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(84vw,280px)] flex-col shadow-2xl">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-3 top-3 z-10 rounded-xl p-2 text-slate-400 transition hover:bg-slate-800"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {isOwner ? (
              <OwnerSidebar {...sidebarProps} />
            ) : (
              <TechnicianSidebar {...sidebarProps} />
            )}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-[250px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb matching screenshot */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>{isOwner ? "Staff Workspace" : "Technician Workspace"}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-extrabold text-slate-900">
                {isOwner ? "Dashboard" : "Active Queue"}
              </span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            {/* Station Status Pill */}
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Bench Station 02 • Active</span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                {user.fullName.slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden text-xs font-extrabold text-slate-800 sm:inline">
                {shortName} {user.fullName.split(" ")[1]?.[0] || ""}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Logout"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
              >
                <Power className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

