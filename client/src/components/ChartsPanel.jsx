import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../utils/formatters.js';

const pieColors = ['#14b8a6', '#f59e0b', '#38bdf8', '#f43f5e', '#8b5cf6'];

export function ChartsPanel({ charts }) {
  const hasStatusData = charts.statusBreakdown?.length > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-6">
        <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-bold text-white">Revenue vs Cost</h2>
          <p className="mt-1 text-sm text-slate-400">Compare financial efficiency across projects.</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueVsCost}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="projectName" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cost" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-bold text-white">Profit by Project</h2>
          <p className="mt-1 text-sm text-slate-400">Positive and negative contribution by project.</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.profitByProject}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="projectName" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="profit" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-white">Status Breakdown</h2>
        <p className="mt-1 text-sm text-slate-400">Rendered only when a status column exists.</p>
        <div className="mt-6 h-80">
          {hasStatusData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                >
                  {charts.statusBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
              No status column was detected in this dataset.
            </div>
          )}
        </div>
        {hasStatusData ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {charts.statusBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
