import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Receipt, BarChart3, Bell,
  Upload, History, LogOut, ChevronLeft, Building2,
  TrendingUp, FileText, Link2, ClipboardList, FileCheck2, Database, HardHat,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/app/executive',     label: 'Dashboard',       icon: TrendingUp,    badge: null },
  { to: '/app/projects',      label: 'Projects',         icon: FolderOpen,    badge: null },
  { to: '/app/construction',  label: 'Construction',     icon: HardHat,       badge: null },
  { to: '/app/analytics',     label: 'Analytics',        icon: BarChart3,     badge: null },
  { to: '/app/accountant',    label: 'Accounts',         icon: Receipt,       badge: null },
  { to: '/app/job-logs',      label: 'Site Reports',     icon: ClipboardList, badge: null },
  { to: '/app/invoices',      label: 'Invoice Builder',  icon: FileCheck2,    badge: null },
  { to: '/app/pdf',           label: 'PDF Extract',      icon: FileText,      badge: null },
  { to: '/app/quickbooks',    label: 'QuickBooks',       icon: Link2,         badge: null },
  { to: '/app/notifications', label: 'Notifications',    icon: Bell,          badge: null },
  { to: '/app/upload',        label: 'Upload Data',      icon: Upload,        badge: null },
  { to: '/app/history',       label: 'Upload History',   icon: Database,      badge: null },
];

export function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() || 'U';

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} flex flex-col`}>
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-3 px-4 border-b border-white/[0.07] shrink-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/20 ring-1 ring-brand-400/25">
          <Building2 className="h-4 w-4 text-brand-400" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <p className="text-sm font-bold tracking-tight text-white truncate">InsightFlow</p>
              <p className="text-[10px] text-slate-500 truncate">Construction Intelligence</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className="ml-auto shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <SidebarItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <div className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300 ring-1 ring-brand-400/20">
            {initials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                className="ml-auto shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ to, label, icon: Icon, badge, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="flex-1 text-sm"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {badge && !collapsed && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="shrink-0 rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-400"
        >
          {badge}
        </motion.span>
      )}
      {badge && collapsed && (
        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-400" />
      )}
    </NavLink>
  );
}
