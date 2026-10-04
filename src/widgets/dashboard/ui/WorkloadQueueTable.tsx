import { ClipboardList } from "lucide-react";
import type { ShopWorkJob, WorkloadStatus } from "@/src/shared/types/dashboard";

const STATUS_STYLE: Record<WorkloadStatus, string> = {
  "Awaiting Approval": "bg-amber-50 text-amber-800 ring-amber-200",
  "Waiting for Parts": "bg-violet-50 text-violet-800 ring-violet-200",
  "Ready for Collection": "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "Ready for Return": "bg-sky-50 text-sky-800 ring-sky-200",
};

function formatReceivedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function WorkloadQueueTable({
  status,
  jobs,
}: {
  status: WorkloadStatus;
  jobs: ShopWorkJob[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${status === "Awaiting Approval" ? "bg-amber-500" : status === "Waiting for Parts" ? "bg-violet-500" : status === "Ready for Collection" ? "bg-emerald-500" : "bg-sky-500"}`} />
          <h2 className="text-sm font-extrabold text-slate-900">{status}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead className="bg-slate-50/80">
            <tr className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
              <th className="px-5 py-3">Job reference</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Device / make & model</th>
              <th className="px-5 py-3">Technician</th>
              <th className="px-5 py-3">Received</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm font-medium text-slate-500">
                  No jobs in this queue match the selected filters.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 text-xs font-extrabold text-blue-700">
                    {job.reference}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800">
                    {job.customer}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">{job.device}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                    {job.assignedTechnician}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-600">
                    {formatReceivedDate(job.receivedAt)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLE[job.status]}`}>
                      <ClipboardList className="h-3 w-3" aria-hidden="true" />
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
