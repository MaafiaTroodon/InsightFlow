import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  ArrowLeft, MapPin, Calendar, Users, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, Activity, Zap, FileText, ChevronRight, Circle,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard.jsx';
import { KPICard } from '../components/ui/KPICard.jsx';
import { Badge, StatusBadge, RiskBadge } from '../components/ui/Badge.jsx';
import { EnterpriseButton } from '../components/ui/EnterpriseButton.jsx';
import { PROJECTS, fmt$, fmtPct, fmtFull$ } from '../data/constructionData.js';
import { TOOLTIP_STYLE } from '../components/ui/chartTheme.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function ProjectDetailPage() {
  const { id } = useParams();
  const project = PROJECTS.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Project not found.</p>
        <Link to="/app/projects" className="mt-3 inline-block text-sm text-brand-400 hover:underline">← Back to Projects</Link>
      </div>
    );
  }

  const variance = ((project.forecastCost - project.budget) / project.budget) * 100;
  const burnData = project.monthlyBurn.map((v, i) => ({ month: MONTHS[i], burn: v / 1000 })).filter(d => d.burn > 0);
  const costBreakdown = [
    { name: 'Labor',     value: project.laborCost     / 1e6 },
    { name: 'Materials', value: project.materialCost  / 1e6 },
    { name: 'Equipment', value: project.equipmentCost / 1e6 },
    { name: 'Overhead',  value: project.overheadCost  / 1e6 },
  ];
  const TABS = ['overview', 'financials', 'schedule', 'invoices', 'insights'];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/app/projects" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={project.status} />
              <RiskBadge risk={project.risk} />
              <Badge variant="default">{project.type}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.client}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.startDate} → {project.endDate}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />PM: {project.pm}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <EnterpriseButton variant="secondary" size="sm" icon={FileText}>Export</EnterpriseButton>
            <EnterpriseButton variant="primary" size="sm" icon={Activity}>Live View</EnterpriseButton>
          </div>
        </div>
      </motion.div>

      {/* Completion bar hero */}
      <GlassCard className="border border-brand-500/15">
        <CardBody>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project Progress</p>
              <p className="text-3xl font-black text-white">{project.completionPct}% <span className="text-sm font-normal text-slate-500">complete</span></p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Budget</p>
                <p className="text-base font-bold text-brand-400">{fmt$(project.budget)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Spent</p>
                <p className={`text-base font-bold ${variance > 5 ? 'text-rose-400' : 'text-slate-200'}`}>{fmt$(project.actualCost)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Forecast</p>
                <p className={`text-base font-bold ${variance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{fmt$(project.forecastCost)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Margin</p>
                <p className={`text-base font-bold ${project.profitability < 10 ? 'text-rose-400' : project.profitability < 18 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {fmtPct(project.profitability)}
                </p>
              </div>
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400"
              initial={{ width: 0 }}
              animate={{ width: `${project.completionPct}%` }}
              transition={{ duration: 1.4, ease: [0.22,1,0.36,1] }}
            />
          </div>
          {project.issues.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{project.issues.length} active issue{project.issues.length !== 1 ? 's' : ''} requiring attention</span>
            </div>
          )}
        </CardBody>
      </GlassCard>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Contract Value" value={fmt$(project.revenue)} icon={DollarSign} accent="brand" delay={0} />
        <KPICard title="Invoiced" value={fmt$(project.invoiced)} icon={FileText} accent="gold" delay={0.05} />
        <KPICard title="Collected" value={fmt$(project.collected)} icon={CheckCircle2} accent="success" delay={0.1} />
        <KPICard title="Budget Variance" value={`${variance > 0 ? '+' : ''}${fmtPct(variance)}`} icon={AlertTriangle} accent={variance > 5 ? 'danger' : variance > 0 ? 'gold' : 'success'} delay={0.15} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.07] pb-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-400 text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <GlassCard className="xl:col-span-2">
            <CardHeader title="Monthly Burn Rate" subtitle="Cost spend by month ($K)" icon={Activity} />
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={burnData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${v}K`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v}K`, 'Burn']} />
                  <Area type="monotone" dataKey="burn" stroke="#f59e0b" strokeWidth={2} fill="url(#burnGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </GlassCard>

          <GlassCard>
            <CardHeader title="Cost Breakdown" subtitle="By category" icon={TrendingUp} />
            <CardBody className="space-y-3">
              {costBreakdown.map((item, i) => {
                const pct = (item.value / (project.actualCost / 1e6)) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{item.name}</span>
                      <span className="font-semibold text-slate-200">${item.value.toFixed(1)}M</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: ['#1fb0aa','#f59e0b','#38bdf8','#a78bfa'][i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.1 * i }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </GlassCard>
        </div>
      )}

      {activeTab === 'schedule' && (
        <GlassCard>
          <CardHeader title="Project Milestones" subtitle="Timeline & completion tracking" icon={Calendar} />
          <CardBody className="space-y-3">
            {project.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.done ? 'bg-emerald-500/15 text-emerald-400' :
                  m.delayed ? 'bg-amber-500/15 text-amber-400' :
                  'bg-white/5 text-slate-500'
                }`}>
                  {m.done
                    ? <CheckCircle2 className="h-4 w-4" />
                    : m.delayed
                    ? <AlertTriangle className="h-4 w-4" />
                    : <Clock className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${m.done ? 'text-slate-400 line-through' : m.delayed ? 'text-amber-300' : 'text-white'}`}>
                    {m.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{m.date}</p>
                  {m.delayed && <Badge variant="warning" size="xs">Delayed</Badge>}
                  {m.done && <Badge variant="success" size="xs">Done</Badge>}
                </div>
              </div>
            ))}
          </CardBody>
        </GlassCard>
      )}

      {activeTab === 'invoices' && (
        <GlassCard>
          <CardHeader title="Project Invoices" subtitle="All vendor invoices for this project" icon={FileText} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Invoice #','Vendor','Amount','Issued','Due','Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {project.invoices.map((inv, i) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-4 text-xs font-mono text-brand-400">{inv.id}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{inv.vendor}</td>
                    <td className="px-5 py-4 text-sm font-bold text-white">{fmtFull$(inv.amount)}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{inv.issued || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{inv.due}</td>
                    <td className="px-5 py-4">
                      <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {project.invoices.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-600">No invoices for this project.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-3">
          {project.aiInsights.map((ins, i) => {
            const colorMap = {
              danger:  { border: 'border-rose-500/25',    bg: 'bg-rose-500/8',    dot: 'bg-rose-400',    label: 'text-rose-400' },
              warning: { border: 'border-amber-500/25',   bg: 'bg-amber-500/8',   dot: 'bg-amber-400',   label: 'text-amber-400' },
              success: { border: 'border-emerald-500/25', bg: 'bg-emerald-500/8', dot: 'bg-emerald-400', label: 'text-emerald-400' },
              info:    { border: 'border-sky-500/25',     bg: 'bg-sky-500/8',     dot: 'bg-sky-400',     label: 'text-sky-400' },
            };
            const c = colorMap[ins.type] || colorMap.info;
            return (
              <motion.div
                key={i}
                className={`rounded-xl border ${c.border} ${c.bg} p-4`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
                  <p className={`text-sm ${c.label}`}>{ins.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <GlassCard>
            <CardHeader title="Financial Summary" subtitle="Budget reconciliation" icon={DollarSign} />
            <CardBody className="space-y-4">
              {[
                { label: 'Contract Value',    value: project.revenue,      color: 'text-brand-400' },
                { label: 'Total Budget',      value: project.budget,       color: 'text-slate-200' },
                { label: 'Actual Spent',      value: project.actualCost,   color: 'text-amber-400' },
                { label: 'Forecast Cost',     value: project.forecastCost, color: variance > 5 ? 'text-rose-400' : 'text-emerald-400' },
                { label: 'Invoiced to Date',  value: project.invoiced,     color: 'text-sky-400' },
                { label: 'Collected',         value: project.collected,    color: 'text-emerald-400' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className={`text-sm font-bold font-mono ${row.color}`}>{fmtFull$(row.value)}</span>
                </div>
              ))}
            </CardBody>
          </GlassCard>

          <GlassCard>
            <CardHeader title="Active Issues" subtitle="Items requiring PM attention" icon={AlertTriangle} accent="danger" />
            <CardBody className="space-y-3">
              {project.issues.length ? project.issues.map((issue, i) => (
                <div key={i} className={`rounded-xl border p-4 ${
                  issue.severity === 'High' ? 'border-rose-500/25 bg-rose-500/8' : 'border-amber-500/25 bg-amber-500/8'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={issue.severity === 'High' ? 'danger' : 'warning'} size="xs">{issue.severity}</Badge>
                    <span className="text-xs text-slate-600">{issue.date}</span>
                  </div>
                  <p className="text-sm text-slate-300">{issue.desc}</p>
                </div>
              )) : (
                <div className="text-center py-6 text-slate-500">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500/40" />
                  <p className="text-sm">No active issues</p>
                </div>
              )}
            </CardBody>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
