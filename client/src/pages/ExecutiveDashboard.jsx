import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, DollarSign, AlertTriangle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Activity, Zap, Target,
  FileText, Download, RefreshCw, ChevronRight,
} from 'lucide-react';
import { KPICard } from '../components/ui/KPICard.jsx';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard.jsx';
import { Badge, StatusBadge, RiskBadge } from '../components/ui/Badge.jsx';
import { EnterpriseButton } from '../components/ui/EnterpriseButton.jsx';
import {
  COMPANY, PROJECTS, MONTHLY_REVENUE, CASHFLOW_FORECAST,
  COST_BREAKDOWN, AI_INSIGHTS, fmt$, fmtFull$, fmtPct,
} from '../data/constructionData.js';

import { TOOLTIP_STYLE } from '../components/ui/chartTheme.js';
const CHART_COLORS = { revenue: '#1fb0aa', cost: '#f59e0b', profit: '#38bdf8', forecast: '#a78bfa' };

const PIE_COLORS = ['#1fb0aa', '#f59e0b', '#38bdf8', '#a78bfa', '#fb7185'];

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function InsightItem({ insight, index }) {
  const colorMap = {
    danger:  { border: 'border-rose-500/30',    bg: 'bg-rose-500/8',    dot: 'bg-rose-400',    label: 'text-rose-400' },
    warning: { border: 'border-amber-500/30',   bg: 'bg-amber-500/8',   dot: 'bg-amber-400',   label: 'text-amber-400' },
    success: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', dot: 'bg-emerald-400', label: 'text-emerald-400' },
    info:    { border: 'border-sky-500/30',     bg: 'bg-sky-500/8',     dot: 'bg-sky-400',     label: 'text-sky-400' },
  };
  const c = colorMap[insight.type] || colorMap.info;

  return (
    <motion.div
      className={`rounded-xl border ${c.border} ${c.bg} p-4 cursor-pointer transition hover:brightness-110`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35 }}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${c.label}`}>{insight.category}</span>
            <span className="text-[10px] text-slate-600">{insight.timestamp}</span>
          </div>
          <p className="text-xs font-semibold text-slate-200">{insight.title}</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{insight.body}</p>
          {insight.action && (
            <Link to={insight.actionTo} className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${c.label} hover:underline`}>
              {insight.action} <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ExecutiveDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const activeProjects = PROJECTS.filter(p => p.status !== 'Completed' && p.status !== 'On Hold');
  const atRisk = PROJECTS.filter(p => p.risk === 'High').length;
  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalActual = PROJECTS.reduce((s, p) => s + p.actualCost, 0);
  const totalForecast = PROJECTS.reduce((s, p) => s + p.forecastCost, 0);
  const budgetVariance = ((totalForecast - totalBudget) / totalBudget) * 100;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">YTD Performance · January 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Refresh
          </EnterpriseButton>
          <EnterpriseButton variant="secondary" size="sm" icon={Download}>
            Export PDF
          </EnterpriseButton>
          <EnterpriseButton variant="primary" size="sm" icon={FileText}>
            Full Report
          </EnterpriseButton>
        </div>
      </motion.div>

      {/* Financial Health Score */}
      <GlassCard className="border border-brand-500/15 overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 ring-1 ring-brand-500/20">
                <span className="text-2xl font-black text-brand-400">{COMPANY.healthScore}</span>
                <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-400/20 px-1.5 text-[9px] font-bold text-emerald-400 ring-1 ring-emerald-400/30">
                  GOOD
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Financial Health Score</p>
                <p className="text-xs text-slate-500 mt-0.5">Based on cash flow, margins, AR aging, and project risk</p>
                <div className="mt-2 h-2 w-48 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${COMPANY.healthScore}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Cash Position', value: fmt$(COMPANY.cashBalance), good: true },
                { label: 'AR Outstanding', value: fmt$(COMPANY.arBalance), good: false },
                { label: 'AP Outstanding', value: fmt$(COMPANY.apBalance), good: null },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${item.good === true ? 'text-emerald-400' : item.good === false ? 'text-amber-400' : 'text-slate-300'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="YTD Revenue" rawValue={COMPANY.ytdRevenue} value={fmt$(COMPANY.ytdRevenue)} icon={DollarSign} accent="brand" change={11.2} delay={0} />
        <KPICard title="YTD Profit" rawValue={COMPANY.ytdProfit} value={fmt$(COMPANY.ytdProfit)} icon={TrendingUp} accent="success" change={8.4} delay={0.05} />
        <KPICard title="Avg Margin" value={fmtPct(COMPANY.ytdMargin)} icon={Activity} accent="sky" change={1.8} delay={0.1} />
        <KPICard title="Active Projects" rawValue={activeProjects.length} icon={Target} accent="gold" delay={0.15} description={`${atRisk} at risk`} />
        <KPICard title="Budget Variance" value={`${budgetVariance > 0 ? '+' : ''}${fmtPct(budgetVariance)}`} icon={AlertTriangle} accent={budgetVariance > 5 ? 'danger' : 'success'} delay={0.2} />
        <KPICard title="Health Score" value={`${COMPANY.healthScore}/100`} icon={CheckCircle2} accent="brand" change={3} delay={0.25} />
      </div>

      {/* Revenue Chart + Cost Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <GlassCard className="xl:col-span-2" delay={0.1}>
          <CardHeader
            title="Revenue vs Cost vs Profit"
            subtitle="Monthly performance — FY 2024"
            icon={TrendingUp}
            action={<Badge variant="brand">YTD</Badge>}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1fb0aa" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1fb0aa" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v, n) => [fmtFull$(v), n.charAt(0).toUpperCase() + n.slice(1)]} />
                <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12, color: '#94a3b8' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1fb0aa" strokeWidth={2} fill="url(#gradRevenue)" />
                <Area type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                <Area type="monotone" dataKey="profit" stroke="#38bdf8" strokeWidth={2} fill="url(#gradProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>

        <GlassCard delay={0.15}>
          <CardHeader title="Cost Breakdown" subtitle="YTD by category" icon={Activity} />
          <CardBody className="space-y-3">
            {COST_BREAKDOWN.map((item, i) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold ${item.trend > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.trend > 0 ? '+' : ''}{item.trend}%
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{fmtPct(item.pct)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: PIE_COLORS[i] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 1, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-white/[0.07]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total YTD Cost</span>
                <span className="font-bold text-amber-400">{fmt$(COMPANY.ytdCost)}</span>
              </div>
            </div>
          </CardBody>
        </GlassCard>
      </div>

      {/* Cash Flow Forecast + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <GlassCard className="xl:col-span-3" delay={0.12}>
          <CardHeader
            title="Cash Flow Forecast"
            subtitle="Next 5 months projected"
            icon={DollarSign}
            accent="gold"
            action={<Badge variant="warning">Projected</Badge>}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={CASHFLOW_FORECAST} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v, n) => [fmtFull$(v), n.charAt(0).toUpperCase() + n.slice(1)]} />
                <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12, color: '#94a3b8' }} />
                <Bar dataKey="inflow" fill="#1fb0aa" radius={[4,4,0,0]} />
                <Bar dataKey="outflow" fill="#f59e0b" radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="cumulative" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>

        <GlassCard className="xl:col-span-2" delay={0.15}>
          <CardHeader
            title="AI Insights"
            subtitle="Rule-based anomaly detection"
            icon={Zap}
            accent="gold"
            action={
              <Badge variant="gold" size="xs">
                {AI_INSIGHTS.filter(i => i.type === 'danger' || i.type === 'warning').length} alerts
              </Badge>
            }
          />
          <CardBody className="space-y-3 overflow-y-auto max-h-72">
            {AI_INSIGHTS.slice(0, 4).map((ins, i) => (
              <InsightItem key={ins.id} insight={ins} index={i} />
            ))}
          </CardBody>
        </GlassCard>
      </div>

      {/* Project Table */}
      <GlassCard delay={0.18}>
        <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Active Projects</h2>
            <p className="text-xs text-slate-500 mt-0.5">Budget vs actual across all live projects</p>
          </div>
          <EnterpriseButton as={Link} to="/app/projects" variant="secondary" size="xs" iconRight={ChevronRight}>
            All Projects
          </EnterpriseButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Project', 'PM', 'Status', 'Completion', 'Budget', 'Actual', 'Variance', 'Margin', 'Risk'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {PROJECTS.slice(0, 5).map((p, i) => {
                const variance = ((p.forecastCost - p.budget) / p.budget) * 100;
                return (
                  <motion.tr
                    key={p.id}
                    className="group hover:bg-white/[0.02] transition cursor-pointer"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                    onClick={() => {}}
                  >
                    <td className="px-5 py-4">
                      <Link to={`/app/projects/${p.id}`} className="group/link">
                        <p className="text-sm font-semibold text-white group-hover/link:text-brand-400 transition">{p.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{p.type}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{p.pm}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.completionPct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{p.completionPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-300">{fmt$(p.budget)}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-300">{fmt$(p.actualCost)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${variance > 5 ? 'text-rose-400' : variance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {variance > 0 ? '+' : ''}{fmtPct(variance)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${p.profitability < 10 ? 'text-rose-400' : p.profitability < 18 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {fmtPct(p.profitability)}
                      </span>
                    </td>
                    <td className="px-5 py-4"><RiskBadge risk={p.risk} /></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Bottom row — profitability by project + project status donut */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-8">
        <GlassCard delay={0.2}>
          <CardHeader title="Project Profitability" subtitle="Margin % by project" icon={TrendingUp} />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={PROJECTS.map(p => ({ name: p.name.split(' ').slice(0, 2).join(' '), margin: p.profitability }))}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 4, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Margin']} />
                <Bar dataKey="margin" radius={[0,4,4,0]}>
                  {PROJECTS.map((p, i) => (
                    <Cell key={p.id} fill={p.profitability < 10 ? '#f43f5e' : p.profitability < 18 ? '#f59e0b' : '#1fb0aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>

        <GlassCard delay={0.22}>
          <CardHeader title="Portfolio Status" subtitle="Projects by current status" icon={Activity} />
          <CardBody className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'On Track', value: PROJECTS.filter(p => p.status === 'On Track' || p.status === 'Active').length },
                    { name: 'At Risk',  value: PROJECTS.filter(p => p.status === 'At Risk').length },
                    { name: 'Delayed',  value: PROJECTS.filter(p => p.status === 'Delayed').length },
                    { name: 'Completed',value: PROJECTS.filter(p => p.status === 'Completed').length },
                    { name: 'On Hold',  value: PROJECTS.filter(p => p.status === 'On Hold').length },
                  ]}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {['#1fb0aa','#f43f5e','#f59e0b','#475569','#fbbf24'].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {[
                { label: 'On Track/Active', color: '#1fb0aa', count: PROJECTS.filter(p => p.status === 'On Track' || p.status === 'Active').length },
                { label: 'At Risk',         color: '#f43f5e', count: PROJECTS.filter(p => p.status === 'At Risk').length },
                { label: 'Delayed',         color: '#f59e0b', count: PROJECTS.filter(p => p.status === 'Delayed').length },
                { label: 'Completed',       color: '#475569', count: PROJECTS.filter(p => p.status === 'Completed').length },
                { label: 'On Hold',         color: '#fbbf24', count: PROJECTS.filter(p => p.status === 'On Hold').length },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="ml-auto text-xs font-bold text-slate-300">{item.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
