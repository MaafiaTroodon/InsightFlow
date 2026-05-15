import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Command, X, ArrowRight, TrendingUp, FolderOpen, Receipt, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const QUICK_LINKS = [
  { label: 'Dashboard',   to: '/app/executive',  icon: TrendingUp },
  { label: 'Projects',    to: '/app/projects',   icon: FolderOpen },
  { label: 'Accounts',    to: '/app/accountant', icon: Receipt    },
  { label: 'Upload Data', to: '/upload',         icon: Upload     },
];

export function Topbar({ collapsed, notifCount = 7 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name?.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() || 'U';

  const openCmd = useCallback(() => { setCmdOpen(true); setQuery(''); }, []);
  const closeCmd = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCmd();
      }
      if (e.key === 'Escape') closeCmd();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCmd, closeCmd]);

  const filtered = QUICK_LINKS.filter(l =>
    !query || l.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''} flex items-center gap-4 px-6`}>
        {/* Search trigger */}
        <button
          onClick={openCmd}
          className="flex flex-1 max-w-xs items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-sm text-slate-500 transition hover:border-white/12 hover:bg-white/5 hover:text-slate-400"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Search anything…</span>
          <div className="ml-auto hidden items-center gap-1 sm:flex">
            <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">⌘K</kbd>
          </div>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-400 transition hover:border-white/12 hover:bg-white/5 hover:text-slate-200"
            >
              <Bell className="h-4 w-4" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <NotifDropdown onClose={() => setNotifOpen(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <Link
            to="/app/executive"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-xs font-bold text-brand-300 ring-1 ring-brand-400/20 transition hover:ring-brand-400/40"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            className="cmd-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCmd}
          >
            <motion.div
              className="w-full max-w-lg mx-4"
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="glass-bright rounded-2xl overflow-hidden shadow-float">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
                  <Command className="h-4 w-4 shrink-0 text-brand-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Navigate to…"
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && filtered.length) {
                        navigate(filtered[0].to);
                        closeCmd();
                      }
                    }}
                  />
                  <button onClick={closeCmd} className="text-slate-500 hover:text-slate-300 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="py-2 max-h-64 overflow-y-auto">
                  {filtered.map(item => (
                    <button
                      key={item.to}
                      onClick={() => { navigate(item.to); closeCmd(); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-brand-400" />
                      <span>{item.label}</span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-600" />
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-500">No results for "{query}"</p>
                  )}
                </div>
                <div className="border-t border-white/[0.07] px-4 py-2 flex items-center gap-4">
                  <span className="text-[10px] text-slate-600">↵ select</span>
                  <span className="text-[10px] text-slate-600">esc close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const NOTIF_ITEMS = [
  { id: 1, type: 'danger',  title: 'Budget Alert',       body: 'Tower Residences is 18% over budget',  time: '2m ago' },
  { id: 2, type: 'warning', title: 'Delayed Project',    body: 'Harbor Bridge Phase 2 is behind schedule', time: '14m ago' },
  { id: 3, type: 'info',    title: 'Invoice Due',        body: 'Steel Supply Co — $84,000 due in 3 days', time: '1h ago' },
  { id: 4, type: 'success', title: 'Milestone Reached',  body: 'Westside Mall reached 75% completion',  time: '3h ago' },
  { id: 5, type: 'warning', title: 'Cost Spike Detected','body': 'Labor costs up 22% on Central Station', time: '5h ago' },
];

const typeColors = {
  danger:  'text-rose-400 bg-rose-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  info:    'text-sky-400 bg-sky-500/10',
  success: 'text-emerald-400 bg-emerald-500/10',
};

function NotifDropdown({ onClose }) {
  return (
    <motion.div
      className="absolute right-0 top-12 w-80 glass-bright rounded-2xl overflow-hidden shadow-float z-50"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <p className="text-sm font-semibold text-white">Notifications</p>
        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400">5 new</span>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.05]">
        {NOTIF_ITEMS.map(n => (
          <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition cursor-pointer">
            <span className={`mt-0.5 shrink-0 rounded-lg p-1.5 text-xs ${typeColors[n.type]}`}>
              <Bell className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200">{n.title}</p>
              <p className="text-xs text-slate-500 truncate">{n.body}</p>
            </div>
            <span className="shrink-0 text-[10px] text-slate-600 mt-0.5">{n.time}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.07] px-4 py-2.5">
        <Link to="/app/notifications" onClick={onClose} className="text-xs text-brand-400 hover:text-brand-300 transition">
          View all notifications →
        </Link>
      </div>
    </motion.div>
  );
}
