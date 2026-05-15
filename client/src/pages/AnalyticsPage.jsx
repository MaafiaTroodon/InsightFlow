import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Activity, Target } from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard.jsx';
import { KPICard } from '../components/ui/KPICard.jsx';
import { TOOLTIP_STYLE } from '../components/ui/chartTheme.js';
import { MONTHLY_REVENUE, PROJECTS, COST_BREAKDOWN, COMPANY, fmt$, fmtPct } from '../data/constructionData.js';

// Quarterly aggregation
const QUARTERLY = [
  { q: 'Q1 24', revenue: MONTHLY_REVENUE.slice(0,3).reduce((s,m) => s + m.revenue, 0), cost: MONTHLY_REVENUE.slice(0,3).reduce((s,m) => s + m.cost, 0) },
  { q: 'Q2 24', revenue: MONTHLY_REVENUE.slice(3,6).reduce((s,m) => s + m.revenue, 0), cost: MONTHLY_REVENUE.slice(3,6).reduce((s,m) => s + m.cost, 0) },
  { q: 'Q3 24', revenue: MONTHLY_REVENUE.slice(6,9).reduce((s,m) => s + m.revenue, 0), cost: MONTHLY_REVENUE.slice(6,9).reduce((s,m) => s + m.cost, 0) },
  { q: 'Q4 24', revenue: MONTHLY_REVENUE.slice(9,12).reduce((s,m) => s + m.revenue, 0), cost: MONTHLY_REVENUE.slice(9,12).reduce((s,m) => s + m.cost, 0) },
].map(q => ({ ...q, profit: q.revenue - q.cost, margin: ((q.revenue - q.cost) / q.revenue * 100).toFixed(1) }));

// Scatter: budget vs profitability
const SCATTER_DATA = PROJECTS.map(p => ({ name: p.name.split(' ').slice(0,2).join(' '), budget: p.budget / 1e6, margin: p.profitability, risk: p.risk }));

const HEATMAP_DATA = PROJECTS.map(p => ({
  project: p.name.split(' ').slice(0,2).join(' '),
  jan: Math.round(p.monthlyBurn[0] / 1000),
  feb: Math.round(p.monthlyBurn[1] / 1000),
  mar: Math.round(p.monthlyBurn[2] / 1000),
  apr: Math.round(p.monthlyBurn[3] / 1000),
  may: Math.round(p.monthlyBurn[4] / 1000),
  jun: Math.round(p.monthlyBurn[5] / 1000),
}));

function HeatmapCell({ value, max }) {
  const intensity = max > 0 ? value / max : 0;
  const bg = intensity === 0
    ? 'rgba(255,255,255,0.02)'
    : `rgba(31, 176, 170, ${0.1 + intensity * 0.75})`;
  return (
    <div
      className="heatmap-cell flex items-center justify-center text-[10px] font-semibold text-slate-300"
      style={{ background: bg, height: 36, borderRadius: 6 }}
    >
      {value > 0 ? `$${value}K` : '—'}
    </div>
  );
}

export function AnalyticsPage() {
  const maxBurn = Math.max(...HEATMAP_DATA.flatMap(r => [r.jan,r.feb,r.mar,r.apr,r.may,r.jun]));
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun'];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Analytics Center</h1>
        <p className="mt-1 text-sm text-slate-500">Advanced visualizations · Performance insights · Trend analysis</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="YTD Revenue"   value={fmt$(COMPANY.ytdRevenue)} icon={DollarSign}  accent="brand"   delay={0}    change={11.2} />
        <KPICard title="YTD Margin"    value={fmtPct(COMPANY.ytdMargin)} icon={TrendingUp} accent="success" delay={0.05} change={1.8} />
        <KPICard title="Avg Burn Rate" value="$1.24M/mo"                 icon={Activity}   accent="gold"    delay={0.1} />
        <KPICard title="Revenue/Employee" value="$172K"                  icon={Target}     accent="sky"     delay={0.15} change={4.8} />
      </div>

      {/* Quarterly + monthly charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <GlassCard delay={0.1}>
          <CardHeader title="Quarterly Revenue & Margin" subtitle="FY 2024 performance" icon={BarChart3} />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={QUARTERLY} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="q" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v, n) => n === 'margin' ? [`${v}%`, 'Margin'] : [`$${(v/1e6).toFixed(1)}M`, n.charAt(0).toUpperCase() + n.slice(1)]} />
                <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12, color: '#94a3b8' }} />
                <Bar dataKey="revenue" fill="#1fb0aa" radius={[4,4,0,0]} />
                <Bar dataKey="cost"    fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="profit"  fill="#38bdf8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>

        <GlassCard delay={0.12}>
          <CardHeader title="Monthly Margin Trend" subtitle="Profit margin % over time" icon={TrendingUp} accent="success" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={MONTHLY_REVENUE.map(m => ({ ...m, margin: ((m.profit / m.revenue) * 100).toFixed(1) }))} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[18, 26]} tickFormatter={v => `${v}%`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Margin']} />
                <Line type="monotone" dataKey="margin" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>
      </div>

      {/* Profitability heatmap */}
      <GlassCard delay={0.14}>
        <CardHeader title="Monthly Burn Rate Heatmap" subtitle="Cost spend by project by month ($K)" icon={Activity} accent="gold" />
        <CardBody>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '160px repeat(6, 1fr)' }}>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider px-2">Project</div>
                {MONTHS.map(m => (
                  <div key={m} className="text-[10px] text-slate-600 uppercase tracking-wider text-center">{m}</div>
                ))}
              </div>
              {HEATMAP_DATA.map((row, i) => (
                <motion.div
                  key={row.project}
                  className="grid gap-1.5 mb-1.5"
                  style={{ gridTemplateColumns: '160px repeat(6, 1fr)' }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                >
                  <div className="flex items-center text-xs text-slate-400 px-2 truncate">{row.project}</div>
                  {MONTHS.map(m => (
                    <HeatmapCell key={m} value={row[m.toLowerCase()]} max={maxBurn} />
                  ))}
                </motion.div>
              ))}
              <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-600">
                <span>Low</span>
                {[0.1,0.25,0.45,0.65,0.85].map(v => (
                  <div key={v} className="h-3 w-8 rounded" style={{ background: `rgba(31,176,170,${v})` }} />
                ))}
                <span>High</span>
              </div>
            </div>
          </div>
        </CardBody>
      </GlassCard>

      {/* Scatter: budget size vs margin */}
      <GlassCard delay={0.16}>
        <CardHeader title="Budget Size vs Profitability" subtitle="Relationship between project scale and margin %" icon={Target} accent="sky" />
        <CardBody>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 8, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="budget" type="number" name="Budget ($M)" domain={[0, 50]} tickFormatter={v => `$${v}M`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Budget ($M)', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 11 }} />
              <YAxis dataKey="margin" type="number" name="Margin %" domain={[-5, 30]} tickFormatter={v => `${v}%`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} formatter={(v, n) => [n === 'margin' ? `${v}%` : `$${v}M`, n === 'margin' ? 'Margin' : 'Budget']} />
              <Scatter data={SCATTER_DATA} fill="#1fb0aa">
                {SCATTER_DATA.map((d, i) => (
                  <Cell key={i} fill={d.risk === 'High' ? '#f43f5e' : d.risk === 'Medium' ? '#f59e0b' : '#1fb0aa'} r={8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-600 justify-end">
            {[['#1fb0aa','Low Risk'],['#f59e0b','Medium Risk'],['#f43f5e','High Risk']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                <span>{l}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </GlassCard>
    </div>
  );
}
