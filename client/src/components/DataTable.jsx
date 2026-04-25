import { formatCurrency, formatDate, formatPercent } from '../utils/formatters.js';

export function DataTable({ rows, title, description }) {
  if (!rows?.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
          No rows available.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Revenue</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Profit</th>
                <th className="px-4 py-3 font-semibold">Margin</th>
                <th className="px-4 py-3 font-semibold">Budget Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.id || `${row.projectName}-${row.date || row.clientName || 'row'}`} className="bg-slate-950/30">
                  <td className="px-4 py-3 font-semibold text-white">{row.projectName || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{row.clientName || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{row.status || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(row.date)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatCurrency(row.revenue)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatCurrency(row.cost)}</td>
                  <td className={`px-4 py-3 font-semibold ${row.profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {formatCurrency(row.profit)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatPercent(row.margin)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        row.isOverBudget ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {row.isOverBudget ? 'Over Budget' : 'On Track'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
