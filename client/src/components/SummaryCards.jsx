import { formatCurrency, formatPercent } from '../utils/formatters.js';

export function SummaryCards({ summary }) {
  const cards = [
    { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), tone: 'text-emerald-300' },
    { label: 'Total Cost', value: formatCurrency(summary.totalCost), tone: 'text-amber-300' },
    { label: 'Total Profit', value: formatCurrency(summary.totalProfit), tone: 'text-teal-300' },
    { label: 'Average Margin', value: formatPercent(summary.averageMargin), tone: 'text-sky-300' },
    { label: 'Projects', value: summary.projectCount, tone: 'text-violet-300' },
    { label: 'Over Budget', value: summary.overBudgetCount, tone: 'text-rose-300' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/30"
        >
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className={`mt-3 text-2xl font-extrabold ${card.tone}`}>{card.value}</p>
        </article>
      ))}
    </div>
  );
}
