import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Receipt, Search, Download, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, DollarSign, FileText, Filter,
  ArrowUpRight, RefreshCw, Zap, Building2,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard.jsx';
import { KPICard } from '../components/ui/KPICard.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EnterpriseButton } from '../components/ui/EnterpriseButton.jsx';
import { INVOICES, VENDORS, COST_BREAKDOWN, fmt$, fmtFull$, fmtPct } from '../data/constructionData.js';
import { TOOLTIP_STYLE } from '../components/ui/chartTheme.js';
const PIE_COLORS = ['#1fb0aa', '#f59e0b', '#38bdf8', '#a78bfa', '#fb7185'];

const INVOICE_TABS = ['All', 'Pending', 'Overdue', 'Paid'];

export function AccountantPage() {
  const [invoiceTab, setInvoiceTab] = useState('All');
  const [search, setSearch] = useState('');

  const overdueInvoices  = INVOICES.filter(i => i.status === 'Overdue');
  const pendingInvoices  = INVOICES.filter(i => i.status === 'Pending');
  const paidInvoices     = INVOICES.filter(i => i.status === 'Paid');
  const totalOverdue     = overdueInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPending     = pendingInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid        = paidInvoices.reduce((s, i) => s + i.amount, 0);

  const filteredInvoices = INVOICES.filter(inv => {
    const matchTab = invoiceTab === 'All' || inv.status === invoiceTab;
    const matchSearch = !search || inv.vendor.toLowerCase().includes(search.toLowerCase()) || inv.project.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const vendorSpendData = VENDORS.slice(0, 6).map(v => ({
    name: v.name.split(' ').slice(0, 2).join(' '),
    spend: v.ytdSpend / 1e6,
  }));

  const categoryData = COST_BREAKDOWN.map(c => ({ name: c.category, value: c.pct }));

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Accountant Workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Invoice reconciliation · Vendor analysis · Financial reports</p>
        </div>
        <div className="flex gap-2">
          <EnterpriseButton variant="secondary" size="sm" icon={Download}>Export Report</EnterpriseButton>
          <EnterpriseButton variant="primary"   size="sm" icon={Zap}>Sync QuickBooks</EnterpriseButton>
        </div>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Overdue Invoices"  value={fmt$(totalOverdue)}  icon={AlertTriangle} accent="danger"  delay={0}    description={`${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? 's' : ''}`} />
        <KPICard title="Pending Approval"  value={fmt$(totalPending)}  icon={Clock}         accent="gold"    delay={0.05} description={`${pendingInvoices.length} invoices`} />
        <KPICard title="Paid This Month"   value={fmt$(totalPaid)}     icon={CheckCircle2}  accent="success" delay={0.1}  description={`${paidInvoices.length} invoices`} />
        <KPICard title="Total YTD AP"      value={fmt$(INVOICES.reduce((s, i) => s + i.amount, 0))} icon={DollarSign} accent="brand" delay={0.15} />
      </div>

      {/* Alerts strip */}
      {overdueInvoices.length > 0 && (
        <motion.div
          className="rounded-xl border border-rose-500/25 bg-rose-500/8 p-4 flex items-start gap-3"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-rose-300">
              {overdueInvoices.length} overdue invoice{overdueInvoices.length !== 1 ? 's' : ''} — {fmt$(totalOverdue)} at risk
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {overdueInvoices.map(i => `${i.id} (${i.vendor})`).join(' · ')}
            </p>
          </div>
          <EnterpriseButton variant="danger" size="xs">Review Now</EnterpriseButton>
        </motion.div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <GlassCard className="xl:col-span-2" delay={0.1}>
          <CardHeader title="Top Vendor Spend" subtitle="YTD by vendor ($M)" icon={Building2} />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vendorSpendData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v}M`} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v.toFixed(1)}M`, 'Spend']} />
                <Bar dataKey="spend" radius={[4,4,0,0]}>
                  {vendorSpendData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#f43f5e' : '#1fb0aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>

        <GlassCard delay={0.12}>
          <CardHeader title="Cost by Category" subtitle="YTD allocation" icon={TrendingUp} />
          <CardBody className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full">
              {categoryData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-xs text-slate-500">{item.name}</span>
                  <span className="ml-auto text-xs font-bold text-slate-300">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardBody>
        </GlassCard>
      </div>

      {/* Vendor table */}
      <GlassCard delay={0.14}>
        <CardHeader title="Vendor Summary" subtitle="All active vendors with spend and invoice status" icon={Building2} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Vendor','Category','YTD Spend','Invoices','Overdue','Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {VENDORS.map((v, i) => (
                <motion.tr
                  key={v.id}
                  className="hover:bg-white/[0.02] transition cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.03 * i }}
                >
                  <td className="px-5 py-4 text-sm font-semibold text-white">{v.name}</td>
                  <td className="px-5 py-4"><Badge variant={v.category === 'Materials' ? 'brand' : v.category === 'Equipment' ? 'gold' : v.category === 'MEP' ? 'sky' : 'default'}>{v.category}</Badge></td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-200 font-mono">{fmt$(v.ytdSpend)}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">{v.invoices}</td>
                  <td className="px-5 py-4">
                    {v.overdue > 0
                      ? <span className="text-xs font-semibold text-rose-400">{v.overdue} overdue</span>
                      : <span className="text-xs text-emerald-400">None</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={v.overdue > 0 ? 'danger' : 'success'}>{v.overdue > 0 ? 'Action Needed' : 'Good Standing'}</Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Invoices */}
      <GlassCard delay={0.16}>
        <div className="p-5 border-b border-white/[0.07] flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">Invoice Register</h2>
            <p className="text-xs text-slate-500 mt-0.5">All project invoices — filter by status</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search invoices…"
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] py-1.5 pl-8 pr-4 text-xs text-slate-300 placeholder:text-slate-600 outline-none focus:border-brand-500/30 transition w-48"
              />
            </div>
            <div className="flex gap-1">
              {INVOICE_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setInvoiceTab(t)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    invoiceTab === t
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                      : 'border border-white/[0.07] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Invoice #','Project','Vendor','Category','Amount','Issued','Due','Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredInvoices.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  className={`hover:bg-white/[0.02] transition cursor-pointer ${inv.status === 'Overdue' ? 'bg-rose-500/[0.03]' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.025 * i }}
                >
                  <td className="px-5 py-4 text-xs font-mono text-brand-400">{inv.id}</td>
                  <td className="px-5 py-4 text-xs text-slate-300 max-w-[160px] truncate">{inv.project}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">{inv.vendor}</td>
                  <td className="px-5 py-4"><Badge variant="default" size="xs">{inv.category}</Badge></td>
                  <td className="px-5 py-4 text-sm font-bold text-white font-mono">{fmtFull$(inv.amount)}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{inv.issued}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{inv.due}</td>
                  <td className="px-5 py-4">
                    <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-600">No invoices found.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
