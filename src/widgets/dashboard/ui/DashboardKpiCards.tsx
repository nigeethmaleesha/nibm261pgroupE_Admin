import {
  ClipboardCheck,
  Package,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import type { WorkloadCounts, WorkloadStatus } from "@/src/shared/types/dashboard";

const KPI_PRESENTATION: {
  status: WorkloadStatus;
  description: string;
  icon: typeof ClipboardCheck;
  colorClass: string;
}[] = [
  {
    status: "Awaiting Approval",
    description: "Estimates needing a customer decision",
    icon: ClipboardCheck,
    colorClass: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    status: "Waiting for Parts",
    description: "Repairs held for incoming parts",
    icon: Package,
    colorClass: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  {
    status: "Ready for Collection",
    description: "Completed jobs awaiting pickup",
    icon: ShoppingBag,
    colorClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    status: "Ready for Return",
    description: "Completed jobs awaiting dispatch",
    icon: RotateCcw,
    colorClass: "bg-sky-50 text-sky-700 ring-sky-100",
  },
];

export function DashboardKpiCards({ counts }: { counts: WorkloadCounts }) {
  return (
    <section aria-label="Filtered workload summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_PRESENTATION.map(({ status, description, icon: Icon, colorClass }) => (
        <article
          key={status}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
                {status}
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {counts[status]}
              </p>
            </div>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${colorClass}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-xs font-medium leading-5 text-slate-500">{description}</p>
        </article>
      ))}
    </section>
  );
}
