import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
  ComposedChart, Line, ReferenceLine,
} from 'recharts';
import { fetchDatasetById } from '../api/datasets.js';
import { ColumnMappingModal } from '../components/ColumnMappingModal.jsx';
import { ReportPreviewModal } from '../components/ReportPreviewModal.jsx';
import {
  ArrowLeft, Upload, AlertTriangle, CheckCircle2,
  TrendingDown, Building2, DollarSign, Zap,
  FileText, ChevronDown, ChevronUp, Tag, Hash, TrendingUp, BarChart2,
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────────
const fmt$ = (v) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Number(v) || 0);
const fmtPct = (v) => `${Number(v || 0).toFixed(1)}%`;
const shortDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—';

const TOOLTIP = {
  contentStyle: { background: 'rgba(11,18,32,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e2e8f0', fontSize: 12 },
  labelStyle:   { color: '#94a3b8', fontWeight: 600, marginBottom: 4 },
  itemStyle:    { color: '#e2e8f0' },
  cursor:       { fill: 'rgba(255,255,255,0.04)' },
};

const PIE_COLORS = ['#6366f1','#22d3ee','#f59e0b','#10b981','#f87171','#a78bfa','#fb923c','#34d399','#60a5fa','#e879f9'];

function KpiCard({ icon: Icon, label, value, sub, color = 'text-brand-400', bg = 'bg-brand-500/15' }) {
  return (
    <div className="rounded-xl border border-rim bg-surface/60 p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className={`text-xl font-bold ${color} leading-tight`}>{value}</div>
        <div className="text-xs text-ink-muted mt-0.5">{label}</div>
        {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-white">{children}</h2>
      {sub && <p className="text-xs text-ink-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function ChartShell({ title, sub, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-rim bg-surface/60 p-4 ${className}`}>
      <SectionTitle sub={sub}>{title}</SectionTitle>
      {children}
    </div>
  );
}

// ── payables-specific dashboard ────────────────────────────────────────────────
function PayablesDashboard({ data }) {
  const { summary, chartData, rows, dataset } = data;
  const [showAllRows, setShowAllRows] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  const totalPayables  = summary.totalCost;
  const projects       = chartData.projectBreakdown || [];
  const vendors        = chartData.vendorBreakdown   || [];
  const categories     = chartData.categoryBreakdown || [];
  const timeline       = chartData.invoiceTimeline   || [];
  const hstIssues      = chartData.hstIssues         || [];
  const creditMemos    = chartData.creditMemos       || [];
  const holdback       = chartData.holdbackTotal     || 0;
  const monthlyByCat   = chartData.monthlyByCategory || [];
  const allCats        = chartData.allCats           || [];
  const topInvoices    = chartData.topInvoices       || [];
  const invoiceCount   = chartData.invoiceCount      || rows.length;
  const avgInvoice     = chartData.avgInvoiceSize    || 0;
  const largestInvoice = chartData.largestInvoice    || 0;
  const uniqueProjects = [...new Set(rows.map(r => r.projectName))].length;

  const displayRows = showAllRows ? rows : rows.slice(0, 12);
  const displayInvoices = showAllInvoices ? topInvoices : topInvoices.slice(0, 8);

  // Category color map so stacked bars are consistent with the legend
  const catColorMap = {};
  allCats.forEach((c, i) => { catColorMap[c] = PIE_COLORS[i % PIE_COLORS.length]; });

  return (
    <div className="space-y-5">
      {/* KPIs — 6 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard icon={DollarSign}    label="Total Payables"   value={fmt$(totalPayables)}  color="text-brand-400"   bg="bg-brand-500/15" />
        <KpiCard icon={Building2}     label="Projects"         value={uniqueProjects}        color="text-sky-400"    bg="bg-sky-500/15" />
        <KpiCard icon={Hash}          label="Invoices"         value={invoiceCount}          color="text-violet-400" bg="bg-violet-500/15" />
        <KpiCard icon={BarChart2}     label="Avg Invoice"      value={fmt$(avgInvoice)}      color="text-cyan-400"   bg="bg-cyan-500/15" />
        <KpiCard icon={AlertTriangle} label="HST Flags"        value={hstIssues.length}
          color={hstIssues.length > 0 ? 'text-amber-400' : 'text-emerald-400'}
          bg={hstIssues.length > 0 ? 'bg-amber-500/15' : 'bg-emerald-500/15'} />
        <KpiCard icon={TrendingDown}  label="Holdback"         value={fmt$(holdback)}        color="text-rose-400"   bg="bg-rose-500/15"
          sub={holdback > 0 ? 'outstanding' : 'none held'} />
      </div>

      {/* Row 1: Cumulative Spend + Category Donut */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartShell title="Monthly Spend + Running Total" sub="Bars = monthly spend · Line = cumulative" className="lg:col-span-2">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={timeline} margin={{ left: 4, right: 16, top: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="bar" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="line" orientation="right" tick={{ fill: '#6366f1', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP} formatter={(v, name) => [fmt$(v), name === 'cumulative' ? 'Running Total' : 'Monthly Spend']} />
                <Legend formatter={v => <span className="text-[11px] text-slate-300">{v === 'total' ? 'Monthly Spend' : 'Running Total'}</span>} />
                <Bar yAxisId="bar" dataKey="total" fill="#22d3ee" radius={[3,3,0,0]} name="total" />
                <Area yAxisId="line" type="monotone" dataKey="cumulative" stroke="#6366f1" fill="url(#cumGrad)" strokeWidth={2} dot={false} name="cumulative" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-ink-muted">No date data available</div>
          )}
        </ChartShell>

        <ChartShell title="Spend by Category" sub="Auto-detected from invoice descriptions">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="42%"
                innerRadius={52} outerRadius={90} paddingAngle={2}>
                {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...TOOLTIP} formatter={v => [fmt$(v), 'Spend']} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-[11px] text-slate-300">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>

      {/* Row 2: Payables by Project ($ + count) + Invoice Count */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartShell title="Payables by Project" sub="Total spend per project code">
          <ResponsiveContainer width="100%" height={Math.max(220, projects.length * 32)}>
            <BarChart data={projects} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="project" width={130} tick={{ fill: '#cbd5e1', fontSize: 11 }}
                tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v} />
              <Tooltip {...TOOLTIP} formatter={(v, name) => [name === 'count' ? v : fmt$(v), name === 'count' ? 'Invoices' : 'Payables']} />
              <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]}>
                {projects.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Invoice Count by Project" sub="Number of invoices processed per project">
          <ResponsiveContainer width="100%" height={Math.max(220, projects.length * 32)}>
            <BarChart data={[...projects].sort((a, b) => (b.count||0) - (a.count||0))} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.08)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="project" width={130} tick={{ fill: '#cbd5e1', fontSize: 11 }}
                tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v} />
              <Tooltip {...TOOLTIP} formatter={v => [v, 'Invoices']} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>

      {/* Row 3: Category trend by month (stacked) + Top Vendors */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartShell title="Monthly Spend by Category" sub="See which cost types are growing each month" className="lg:col-span-2">
          {monthlyByCat.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyByCat} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP} formatter={v => [fmt$(v)]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-[11px] text-slate-300">{v}</span>} />
                {allCats.map((cat, i) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={PIE_COLORS[i % PIE_COLORS.length]}
                    radius={i === allCats.length - 1 ? [3,3,0,0] : [0,0,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-ink-muted">No monthly data available</div>
          )}
        </ChartShell>

        <ChartShell title="Top Vendors by Spend" sub={`${vendors.length} vendors`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={vendors.slice(0, 8)} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="vendor" width={140} tick={{ fill: '#cbd5e1', fontSize: 10 }}
                tickFormatter={v => v.length > 20 ? v.slice(0, 20) + '…' : v} />
              <Tooltip {...TOOLTIP} formatter={v => [fmt$(v), 'Total Invoiced']} />
              <Bar dataKey="total" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>

      {/* Top Invoices */}
      {topInvoices.length > 0 && (
        <ChartShell title="Largest Invoices" sub="Sorted by amount — highest single invoices">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-rim text-ink-muted">
                  {['#','Project','Vendor','Invoice #','Description','HST','Amount'].map(h => (
                    <th key={h} className="text-left py-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayInvoices.map((inv, i) => (
                  <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${inv.amount < 0 ? 'text-emerald-400' : ''}`}>
                    <td className="py-2 pr-3 text-ink-muted font-mono">{i + 1}</td>
                    <td className="py-2 pr-4 max-w-[110px]"><span className="truncate block text-white/80">{inv.project}</span></td>
                    <td className="py-2 pr-4 max-w-[130px]"><span className="truncate block text-white/80">{inv.vendor}</span></td>
                    <td className="py-2 pr-4 text-ink-muted font-mono">{inv.invoiceNumber || '—'}</td>
                    <td className="py-2 pr-4 max-w-[200px]">
                      <span className="truncate block text-white/70" title={inv.description}>{inv.description}</span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-ink-muted">{inv.hst > 0 ? fmt$(inv.hst) : '—'}</td>
                    <td className={`py-2 text-right font-mono font-semibold ${inv.amount < 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {fmt$(inv.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {topInvoices.length > 8 && (
            <button onClick={() => setShowAllInvoices(p => !p)}
              className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted hover:text-white transition-colors">
              {showAllInvoices ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showAllInvoices ? 'Show less' : `Show all ${topInvoices.length} largest invoices`}
            </button>
          )}
        </ChartShell>
      )}

      {/* Invoice Register */}
      <ChartShell title="Invoice Register" sub={`All ${rows.length} invoices from ${dataset.originalFileName}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rim text-ink-muted">
                {['Date','Project','Vendor','Invoice #','Description','Subtotal','HST','Total','Flags'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => {
                const isCredit = (row.cost || row.revenue) < 0;
                const hasFlag  = row.notes && (row.notes.toLowerCase().includes('verify') || row.notes.toLowerCase().includes('hst'));
                return (
                  <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${isCredit ? 'text-emerald-400' : ''}`}>
                    <td className="py-2 pr-4 whitespace-nowrap text-ink-muted">
                      {row.invoiceDate ? shortDate(row.invoiceDate) : row.date ? shortDate(row.date) : '—'}
                    </td>
                    <td className="py-2 pr-4 max-w-[110px]"><span className="truncate block text-white/80">{row.projectName}</span></td>
                    <td className="py-2 pr-4 max-w-[130px]"><span className="truncate block text-white/80">{row.vendor || row.clientName || '—'}</span></td>
                    <td className="py-2 pr-4 text-ink-muted font-mono">{row.invoiceNumber || '—'}</td>
                    <td className="py-2 pr-4 max-w-[200px]">
                      <span className="truncate block text-white/70" title={row.description || row.projectName}>
                        {(row.description || row.projectName || '').slice(0, 48)}{(row.description || '').length > 48 ? '…' : ''}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono whitespace-nowrap">
                      {row.hst > 0 ? fmt$(row.cost - row.hst) : '—'}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono whitespace-nowrap text-ink-muted">
                      {row.hst > 0 ? fmt$(row.hst) : '—'}
                    </td>
                    <td className={`py-2 pr-4 text-right font-mono font-semibold whitespace-nowrap ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
                      {fmt$(row.cost !== 0 ? row.cost : row.revenue)}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        {isCredit && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">Credit</span>}
                        {hasFlag  && <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-medium">HST</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length > 12 && (
          <button onClick={() => setShowAllRows(p => !p)}
            className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted hover:text-white transition-colors">
            {showAllRows ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAllRows ? 'Show less' : `Show all ${rows.length} invoices`}
          </button>
        )}
      </ChartShell>

      {/* HST Issues + Credit Memos */}
      {(hstIssues.length > 0 || creditMemos.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-4">
          {hstIssues.length > 0 && (
            <ChartShell title="HST Flags" sub="Invoices flagged for tax rate verification">
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {hstIssues.map((item, i) => (
                  <div key={i} className="rounded-lg bg-amber-500/8 border border-amber-500/20 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.vendor}</div>
                        <div className="text-xs text-ink-muted mt-0.5">{item.project}</div>
                      </div>
                      <span className="text-sm font-bold text-amber-400 whitespace-nowrap">{fmt$(item.amount)}</span>
                    </div>
                    {item.notes && <p className="text-[11px] text-amber-300/80 mt-1.5 leading-relaxed">{item.notes}</p>}
                  </div>
                ))}
              </div>
            </ChartShell>
          )}
          {creditMemos.length > 0 && (
            <ChartShell title="Credit Memos" sub="Returns and price corrections (negative amounts)">
              <div className="space-y-2">
                {creditMemos.map((item, i) => (
                  <div key={i} className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.vendor}</div>
                        <div className="text-xs text-ink-muted mt-0.5 truncate">{item.description}</div>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">{fmt$(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartShell>
          )}
        </div>
      )}
    </div>
  );
}

// ── standard (non-payables) dashboard ─────────────────────────────────────────
function StandardDashboard({ data }) {
  const { summary, chartData, rows } = data;
  const fmt = (v) => fmt$(v);
  const topProjects = [...(chartData.projectFinancials || [])].sort((a,b) => b.revenue - a.revenue).slice(0, 10);
  const topMargin   = [...(chartData.marginByProject   || [])].sort((a,b) => b.marginPercent - a.marginPercent).slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Revenue', value: fmt$(summary.totalRevenue),            color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: DollarSign },
          { label: 'Total Cost',    value: fmt$(summary.totalCost),               color: 'text-amber-400',   bg: 'bg-amber-500/15',   icon: TrendingDown },
          { label: 'Total Profit',  value: fmt$(summary.totalProfit),             color: summary.totalProfit >= 0 ? 'text-teal-400' : 'text-rose-400', bg: 'bg-teal-500/15', icon: CheckCircle2 },
          { label: 'Avg Margin',    value: fmtPct(summary.averageMargin * 100),   color: 'text-sky-400',     bg: 'bg-sky-500/15',     icon: Zap },
          { label: 'Projects',      value: summary.projectCount,                  color: 'text-violet-400',  bg: 'bg-violet-500/15',  icon: Building2 },
          { label: 'Over Budget',   value: summary.overBudgetCount,               color: summary.overBudgetCount > 0 ? 'text-rose-400' : 'text-emerald-400', bg: 'bg-rose-500/15', icon: AlertTriangle },
        ].map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartShell title="Revenue vs Cost" sub="Top projects by revenue" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProjects} margin={{ bottom: 60, top: 4, left: 0, right: 8 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis dataKey="projectName" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-35} textAnchor="end" height={70}
                tickFormatter={v => v.length > 14 ? v.slice(0,14)+'…' : v} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TOOLTIP} formatter={(v, n) => [fmt$(v), n === 'revenue' ? 'Revenue' : 'Cost']} />
              <Legend formatter={v => <span className="text-xs text-slate-300">{v === 'revenue' ? 'Revenue' : 'Cost'}</span>} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="cost"    fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Margin by Project" sub="Gross margin %">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topMargin} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.1)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="projectName" width={100} tick={{ fill: '#cbd5e1', fontSize: 10 }}
                tickFormatter={v => v.length > 14 ? v.slice(0,14)+'…' : v} />
              <Tooltip {...TOOLTIP} formatter={v => [`${v}%`, 'Margin']} />
              <Bar dataKey="marginPercent" fill="#a78bfa" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>

      {/* Category breakdown if available */}
      {(chartData.categoryBreakdown?.length > 0 || chartData.vendorBreakdown?.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-4">
          {chartData.categoryBreakdown?.length > 0 && (
            <ChartShell title="Spend by Category">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData.categoryBreakdown} dataKey="total" nameKey="category" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {chartData.categoryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP} formatter={v => [fmt$(v), 'Spend']} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-[11px] text-slate-300">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </ChartShell>
          )}
          {chartData.vendorBreakdown?.length > 0 && (
            <ChartShell title="Top Vendors">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.vendorBreakdown.slice(0,6)} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="vendor" width={130} tick={{ fill: '#cbd5e1', fontSize: 10 }}
                    tickFormatter={v => v.length > 20 ? v.slice(0,20)+'…' : v} />
                  <Tooltip {...TOOLTIP} formatter={v => [fmt$(v), 'Total']} />
                  <Bar dataKey="total" fill="#22d3ee" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          )}
        </div>
      )}

      {/* Cleaned rows table */}
      <ChartShell title="Cleaned Rows" sub="Business-ready records">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rim text-ink-muted">
                {['Project','Client','Date','Revenue','Cost','Profit','Margin'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 15).map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="py-2 pr-4 max-w-[160px]"><span className="truncate block text-white/80">{row.projectName}</span></td>
                  <td className="py-2 pr-4 text-ink-muted">{row.clientName || '—'}</td>
                  <td className="py-2 pr-4 text-ink-muted whitespace-nowrap">{row.date ? shortDate(row.date) : '—'}</td>
                  <td className="py-2 pr-4 text-right font-mono text-emerald-400">{fmt$(row.revenue)}</td>
                  <td className="py-2 pr-4 text-right font-mono text-amber-400">{fmt$(row.cost)}</td>
                  <td className={`py-2 pr-4 text-right font-mono ${row.profit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>{fmt$(row.profit)}</td>
                  <td className="py-2 text-right font-mono text-slate-300">{fmtPct(row.marginPercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartShell>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchDatasetById(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-surface border border-rim animate-pulse" />)}
    </div>
  );

  if (error || !data) return (
    <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
      <FileText className="w-12 h-12 text-ink-muted/30 mb-4" />
      <div className="text-white/60 font-medium">{error || 'Dataset not found'}</div>
      <button onClick={() => navigate('/app/history')} className="mt-4 text-sm text-brand-400 hover:text-brand-300 underline">
        Back to Upload History
      </button>
    </div>
  );

  const isPayables = data.summary.totalCost > 0 && data.summary.totalRevenue === 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/app/history')}
            className="w-8 h-8 rounded-lg bg-surface border border-rim flex items-center justify-center text-ink-muted hover:text-white hover:border-brand-500/40 transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white truncate">{data.dataset.name}</h1>
              {isPayables && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/25 font-medium">
                  Payables Register
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {data.dataset.originalFileName} · {data.dataset.rowCount} rows · uploaded {new Date(data.dataset.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button onClick={() => setMappingOpen(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-rim text-ink-muted hover:text-white hover:border-brand-500/40 transition-colors">
            <Tag className="w-3.5 h-3.5" /> Column Map
          </button>
          <button onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-rim text-ink-muted hover:text-white hover:border-brand-500/40 transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF Report
          </button>
          <Link to="/app/upload"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload New
          </Link>
        </div>
      </div>

      {/* Executive Summary */}
      {data.executiveSummary?.length > 0 && (
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wide">Auto Summary</span>
          </div>
          <div className="space-y-1">
            {data.executiveSummary.map((line, i) => (
              <p key={i} className="text-sm text-white/80 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Main dashboard */}
      {isPayables
        ? <PayablesDashboard data={data} />
        : <StandardDashboard data={data} />
      }

      <ColumnMappingModal isOpen={mappingOpen} onClose={() => setMappingOpen(false)}
        columnMapping={data.columnMapping || data.dataset.columnMapping} />
      <ReportPreviewModal isOpen={reportOpen} onClose={() => setReportOpen(false)} data={data} />
    </div>
  );
}
