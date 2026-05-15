import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, CheckCircle2, Info, TrendingUp,
  Clock, Filter, CheckCheck, Trash2, ChevronRight,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EnterpriseButton } from '../components/ui/EnterpriseButton.jsx';
import { AI_INSIGHTS, NOTIFICATIONS } from '../data/constructionData.js';

const TYPE_ICON = {
  danger:  AlertTriangle,
  warning: Clock,
  success: CheckCircle2,
  info:    Info,
};
const TYPE_COLOR = {
  danger:  { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20'    },
  warning: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20'   },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  info:    { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/20'     },
};
const FILTER_TABS = ['All', 'Unread', 'Budget', 'Schedule', 'Invoice', 'Cost'];

export function NotificationsPage() {
  const [filter, setFilter]   = useState('All');
  const [items, setItems]     = useState(NOTIFICATIONS);

  const filtered = items.filter(n => {
    if (filter === 'All')    return true;
    if (filter === 'Unread') return !n.read;
    return n.category === filter;
  });

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount} unread · {items.length} total</p>
        </div>
        <EnterpriseButton variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all read
        </EnterpriseButton>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_TABS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === f
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                : 'border border-white/[0.07] text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((notif, i) => {
            const Icon = TYPE_ICON[notif.type] || Info;
            const c = TYPE_COLOR[notif.type] || TYPE_COLOR.info;
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: 0.03 * i, duration: 0.3 }}
                className={`flex items-start gap-4 rounded-xl border p-4 transition ${c.border} ${notif.read ? 'opacity-60' : ''} hover:opacity-100`}
              >
                <div className={`shrink-0 rounded-xl p-2 ${c.bg}`}>
                  <Icon className={`h-4 w-4 ${c.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant={notif.type === 'danger' ? 'danger' : notif.type === 'warning' ? 'warning' : notif.type === 'success' ? 'success' : 'info'} size="xs">
                      {notif.category}
                    </Badge>
                    {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />}
                  </div>
                  <p className="text-sm font-semibold text-white">{notif.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.body}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="text-[10px] text-slate-600">{notif.time}</span>
                  {!notif.read && (
                    <button
                      onClick={() => setItems(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                      className="text-[10px] text-brand-400 hover:text-brand-300 transition"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications in this category.</p>
          </div>
        )}
      </div>

      {/* AI Insights feed */}
      <div>
        <h2 className="text-sm font-bold text-white mb-4">AI Intelligence Feed</h2>
        <div className="space-y-3">
          {AI_INSIGHTS.map((ins, i) => {
            const c = TYPE_COLOR[ins.type] || TYPE_COLOR.info;
            return (
              <motion.div
                key={ins.id}
                className={`rounded-xl border ${c.border} p-4`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${c.text.replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={ins.type === 'danger' ? 'danger' : ins.type === 'warning' ? 'warning' : ins.type === 'success' ? 'success' : 'info'} size="xs">
                        {ins.category}
                      </Badge>
                      <span className="text-[10px] text-slate-600">{ins.timestamp}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{ins.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ins.body}</p>
                    {ins.action && (
                      <Link to={ins.actionTo} className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${c.text} hover:underline`}>
                        {ins.action} <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
