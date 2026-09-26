"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Gauge,
  Megaphone,
  RefreshCw,
  Truck,
} from "lucide-react";

export function TechnicianBenchAuxiliaryCards({
  onSelectJobRef,
}: {
  onSelectJobRef?: (ref: string) => void;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState("08:30 AM today");

  const handleRecheck = () => {
    setRechecking(true);
    setTimeout(() => {
      setRechecking(false);
      setLastCheckTime("Just now");
    }, 600);
  };

  return (
    <div id="parts" className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. Bench Instruments */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Gauge className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Bench Instruments</h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All Pass
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Daily safety checks & multimeters calibration
          </p>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Hakko Soldering Station #04
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-slate-600">350°C Ready</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Rigol 100MHz Oscilloscope
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-slate-600">Cal. Nov 2026</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  ESD Ground Strap & Mat Monitor
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-600">Zero Voltage Pass</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 font-medium">
          <span>Logged at {lastCheckTime}</span>
          <button
            type="button"
            onClick={handleRecheck}
            disabled={rechecking}
            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700"
          >
            {rechecking && <RefreshCw className="h-3 w-3 animate-spin" />}
            Re-check Station
          </button>
        </div>
      </div>

      {/* 2. Parts Request Feed */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Truck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Parts Request Feed</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 cursor-pointer">
              View All <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Pending items for your active jobs
          </p>

          <div className="mt-4 space-y-2.5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">
                  Fan Assy & Heatpipe 65W
                </span>
                <button
                  type="button"
                  onClick={() => onSelectJobRef?.("RF-2026-002")}
                  className="rounded-md bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-black text-blue-700 hover:bg-blue-200"
                >
                  RF-2026-002
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Supplier: Micro-Parts Ltd • Tracking: PK-9941
              </p>
              <div className="mt-2 flex items-center gap-1.5 font-bold text-rose-600">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Courier expected today at 02:30 PM
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">
                  Galaxy A52 OEM OLED Panel
                </span>
                <button
                  type="button"
                  onClick={() => onSelectJobRef?.("RF-2026-001")}
                  className="rounded-md bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-black text-blue-700 hover:bg-blue-200"
                >
                  RF-2026-001
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Pulled from Internal Vault Shelf C-02
              </p>
              <div className="mt-2 flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ready at Bench Station
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-semibold">
          <span>1 pending delivery • 1 staged</span>
          <span className="font-mono font-bold text-slate-700">Total allocated: LKR 84.50</span>
        </div>
      </div>

      {/* 3. Dispatch Announcements */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Megaphone className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Dispatch Announcements</h3>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
              Shop Memo
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Updates from Front Desk & Inventory Mgr
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div>
                <p className="font-bold text-slate-900">Express Triage Turnaround Policy</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  High priority commercial laptops require initial multimeter scan and customer
                  update within 4 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="font-bold text-slate-900">BGA Rework Station Filter Service</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  Scheduled fume extractor filter swap today at 05:00 PM. Station 01 & 02 will
                  share secondary extractor.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="font-semibold text-slate-500">Shift Lead: Praveen M.</span>
          <button
            type="button"
            onClick={() => setAcknowledged(true)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              acknowledged
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {acknowledged ? "Acknowledged ✓" : "Acknowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}
