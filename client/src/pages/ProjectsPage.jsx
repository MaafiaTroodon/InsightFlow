import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  FolderOpen, Search, Filter, SlidersHorizontal, Plus, ChevronRight,
  MapPin, Calendar, DollarSign, AlertTriangle, TrendingUp,
  Users, Clock, Target, ArrowUpRight,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard.jsx';
import { KPICard } from '../components/ui/KPICard.jsx';
import { Badge, StatusBadge, RiskBadge } from '../components/ui/Badge.jsx';
import { EnterpriseButton } from '../components/ui/EnterpriseButton.jsx';
import { PROJECTS, fmt$, fmtPct, fmtFull$ } from '../data/constructionData.js';
import { TOOLTIP_STYLE } from '../components/ui/chartTheme.js';

const STATUS_FILTERS = ['All', 'Active', 'On Track', 'Delayed', 'At Risk', 'Completed', 'On Hold'];
const RISK_FILTERS   = ['All', 'Low', 'Medium', 'High'];

function ProjectCard({ project, index }) {
  const variance = ((project.forecastCost - project.budget) / project.budget) * 100;
  const daysLeft = Math.round((new Date(project.endDate) - new Date()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.04 * index, ease: [0.22,1,0.36,1] }}
    >
      <Link to={`/app/projects/${project.id}`}>
        <div className="glass-card kpi-card rounded-2xl overflow-hidden border border-white/[0.07] hover:border-brand-500/20 transition-all duration-300 group cursor-pointer">
          {/* Status bar */}
          <div className={`h-1 w-full ${
            project.status === 'At Risk'   ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
            project.status === 'Delayed'   ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
            project.status === 'Completed' ? 'bg-gradient-to-r from-slate-600 to-slate-500' :
            project.status === 'On Hold'   ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
            'bg-gradient-to-r from-brand-600 to-brand-400'
          }`} />

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusBadge status={project.status} />
                  <RiskBadge risk={project.risk} />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition truncate">{project.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{project.client}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-brand-400 transition mt-0.5" />
            </div>

            {/* Completion bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Completion</span>
                <span className="text-xs font-bold text-slate-300">{project.completionPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.completionPct}%` }}
                  transition={{ duration: 1.2, delay: 0.1 + 0.04 * index, ease: [0.22,1,0.36,1] }}
                />
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Budget</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5">{fmt$(project.budget)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Actual</p>
                <p className={`text-sm font-bold mt-0.5 ${variance > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {fmt$(project.actualCost)}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Margin</p>
                <p className={`text-sm font-bold mt-0.5 ${project.profitability < 10 ? 'text-rose-400' : project.profitability < 18 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {fmtPct(project.profitability)}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">Variance</p>
                <p className={`text-sm font-bold mt-0.5 ${variance > 5 ? 'text-rose-400' : variance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {variance > 0 ? '+' : ''}{fmtPct(variance)}
                </p>
              </div>
            </div>

            {/* Footer meta */}
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{project.contractorCount} contractors</span>
              </div>
            </div>

            {/* AI alerts */}
            {project.aiInsights.filter(i => i.type === 'danger' || i.type === 'warning').length > 0 && (
              <div className="mt-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 px-3 py-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                  <p className="text-[11px] text-amber-300">
                    {project.aiInsights.find(i => i.type === 'danger' || i.type === 'warning')?.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter]   = useState('All');
  const [search, setSearch]           = useState('');
  const [view, setView]               = useState('grid'); // grid | table

  const filtered = PROJECTS.filter(p => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchRisk   = riskFilter === 'All'   || p.risk === riskFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRisk && matchSearch;
  });

  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalActual = PROJECTS.reduce((s, p) => s + p.actualCost, 0);
  const atRisk = PROJECTS.filter(p => p.risk === 'High').length;
  const avgCompletion = Math.round(PROJECTS.reduce((s, p) => s + p.completionPct, 0) / PROJECTS.length);

  const budgetData = PROJECTS.map(p => ({
    name: p.name.split(' ').slice(0,2).join(' '),
    budget: p.budget / 1e6,
    actual: p.actualCost / 1e6,
  }));

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Project Intelligence</h1>
          <p className="mt-1 text-sm text-slate-500">{PROJECTS.length} projects · {PROJECTS.filter(p => p.status !== 'Completed').length} active</p>
        </div>
        <EnterpriseButton variant="primary" size="sm" icon={Plus}>New Project</EnterpriseButton>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total Budget" value={fmt$(totalBudget)} icon={DollarSign} accent="brand" delay={0} />
        <KPICard title="Total Spent" value={fmt$(totalActual)} icon={TrendingUp} accent="gold" delay={0.05} />
        <KPICard title="High Risk" rawValue={atRisk} icon={AlertTriangle} accent="danger" delay={0.1} description={`${atRisk} of ${PROJECTS.length} projects`} />
        <KPICard title="Avg Completion" value={`${avgCompletion}%`} icon={Target} accent="sky" delay={0.15} />
      </div>

      {/* Budget chart */}
      <GlassCard delay={0.1}>
        <CardHeader title="Budget vs Actual by Project" subtitle="All active projects" icon={BarChart} />
        <CardBody>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={budgetData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v}M`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v.toFixed(1)}M`]} />
              <Bar dataKey="budget" fill="rgba(31,176,170,0.25)" radius={[4,4,0,0]} />
              <Bar dataKey="actual"  fill="#1fb0aa" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </GlassCard>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or clients…"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2 pl-9 pr-4 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-brand-500/30 focus:bg-white/[0.05] transition"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === f
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                  : 'border border-white/[0.07] text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          {['grid','table'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                view === v
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                  : 'border border-white/[0.07] text-slate-500 hover:text-slate-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Projects */}
      <AnimatePresence mode="wait">
        {view === 'grid' ? (
          <motion.div
            key="grid"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Project','Client','Status','Complete','Budget','Actual','Forecast','Margin','Risk','PM'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((p, i) => {
                      const variance = ((p.forecastCost - p.budget) / p.budget) * 100;
                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: 0.03 * i }}
                          className="hover:bg-white/[0.02] transition"
                        >
                          <td className="px-5 py-4">
                            <Link to={`/app/projects/${p.id}`} className="text-sm font-semibold text-white hover:text-brand-400 transition">{p.name}</Link>
                            <p className="text-xs text-slate-600">{p.type}</p>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">{p.client}</td>
                          <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-12 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.completionPct}%` }} />
                              </div>
                              <span className="text-xs text-slate-400">{p.completionPct}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs font-mono text-slate-300">{fmt$(p.budget)}</td>
                          <td className="px-5 py-4 text-xs font-mono text-slate-300">{fmt$(p.actualCost)}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold ${variance > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>{fmt$(p.forecastCost)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold ${p.profitability < 18 ? 'text-amber-400' : 'text-emerald-400'}`}>{fmtPct(p.profitability)}</span>
                          </td>
                          <td className="px-5 py-4"><RiskBadge risk={p.risk} /></td>
                          <td className="px-5 py-4 text-xs text-slate-400">{p.pm}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No projects match your filters.</p>
        </div>
      )}
    </div>
  );
}
