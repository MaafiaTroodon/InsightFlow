import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2, CheckCircle2, AlertTriangle, RefreshCw, Clock, Database,
  ArrowRight, Zap, FileText, DollarSign, Users, Building2, ExternalLink,
  XCircle, Settings, ChevronRight,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

const QB_MODULES = [
  { icon: FileText,   label: 'Invoices',     count: null, description: 'AR/AP invoice register' },
  { icon: DollarSign, label: 'Expenses',     count: null, description: 'Cost transactions' },
  { icon: Users,      label: 'Customers',    count: null, description: 'Client accounts' },
  { icon: Building2,  label: 'Vendors',      count: null, description: 'Supplier accounts' },
];

const SYNC_LOGS = [
  { time: '--:--', event: 'No sync history', status: 'info' },
];

const FEATURE_LIST = [
  'Automatically import invoices, bills, and expenses from QuickBooks',
  'Sync vendor and customer data to power the Accountant workspace',
  'Map QuickBooks projects to InsightFlow job tracking',
  'Real-time cost vs budget reconciliation against your QBO data',
  'Schedule automatic syncs — daily, weekly, or on-demand',
];

export default function QuickBooksPage() {
  const [connected, setConnected]     = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const [lastSync, setLastSync]       = useState(null);
  const [syncError, setSyncError]     = useState(null);
  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleConnect = () => {
    // In production: redirect to GET /api/quickbooks/connect which returns Intuit OAuth URL
    window.open('/api/quickbooks/connect', '_blank');
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch('/api/quickbooks/sync', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message || 'Sync failed');
      setLastSync(new Date().toISOString());
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/quickbooks/disconnect', { method: 'POST', credentials: 'include' });
      setConnected(false);
      setLastSync(null);
    } catch {
      // silently ignore
    }
    setShowDisconnect(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2CA01C]/20 border border-[#2CA01C]/40 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-[#2CA01C]" />
          </div>
          QuickBooks Gateway
        </h1>
        <p className="text-ink-muted mt-1 text-sm">
          Connect your QuickBooks Online account to sync real financial data directly into InsightFlow.
        </p>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border px-5 py-4 flex items-center justify-between ${
          connected
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-surface border-rim'
        }`}
      >
        <div className="flex items-center gap-3">
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-ink-muted shrink-0" />
          )}
          <div>
            <div className="font-semibold text-white text-sm">
              {connected ? 'Connected to QuickBooks Online' : 'Not connected'}
            </div>
            <div className="text-ink-muted text-xs mt-0.5">
              {connected
                ? lastSync
                  ? `Last sync: ${new Date(lastSync).toLocaleString()}`
                  : 'Connected — sync not yet run'
                : 'Connect your QBO account to start syncing data'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected && (
            <>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:bg-brand-500/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              <button
                onClick={() => setShowDisconnect(true)}
                className="text-xs text-ink-muted hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10"
              >
                Disconnect
              </button>
            </>
          )}
          {!connected && (
            <button
              onClick={handleConnect}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-[#2CA01C] text-white font-medium hover:bg-[#228A15] transition-colors"
            >
              Connect QuickBooks
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {syncError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {syncError}
        </div>
      )}

      {/* Data Modules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QB_MODULES.map(({ icon: Icon, label, count, description }) => (
          <GlassCard key={label} className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-brand-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {connected && count !== null ? count.toLocaleString() : '—'}
            </div>
            <div className="text-xs font-medium text-white/80 mt-0.5">{label}</div>
            <div className="text-xs text-ink-muted mt-1">{description}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* How It Works */}
        <GlassCard>
          <CardHeader icon={Zap} title="What Gets Synced" accent="brand" />
          <CardBody>
            <ul className="space-y-3">
              {FEATURE_LIST.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardBody>
        </GlassCard>

        {/* Sync Log */}
        <GlassCard>
          <CardHeader icon={Clock} title="Sync History" accent="sky" />
          <CardBody>
            {connected ? (
              <div className="space-y-2">
                {SYNC_LOGS.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-rim/30 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      log.status === 'success' ? 'bg-emerald-400' :
                      log.status === 'error'   ? 'bg-red-400' : 'bg-sky-400'
                    }`} />
                    <div>
                      <div className="text-xs font-medium text-white">{log.event}</div>
                      <div className="text-xs text-ink-muted">{log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-ink-muted text-sm">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Connect QuickBooks to start syncing data
              </div>
            )}
          </CardBody>
        </GlassCard>
      </div>

      {/* OAuth Setup Instructions */}
      <GlassCard>
        <CardHeader icon={Settings} title="Integration Setup" accent="gold" />
        <CardBody>
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              InsightFlow uses QuickBooks OAuth 2.0 for secure authentication. Your credentials are never stored — only a short-lived access token is used for each sync.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Click Connect',    desc: 'You\'ll be redirected to Intuit\'s secure login page' },
                { step: '2', title: 'Authorize Access', desc: 'Grant read-only access to your QBO company data' },
                { step: '3', title: 'Data Flows In',    desc: 'Invoices, expenses, and vendors sync automatically' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-xs font-bold text-gold-400 shrink-0">
                    {step}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{title}</div>
                    <div className="text-xs text-ink-muted mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                QuickBooks OAuth 2.0 Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardBody>
      </GlassCard>

      {/* Disconnect Confirm Modal */}
      {showDisconnect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-canvas border border-rim rounded-2xl p-6 max-w-sm w-full shadow-float"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Disconnect QuickBooks?</div>
                <div className="text-xs text-ink-muted">Synced data won't be deleted</div>
              </div>
            </div>
            <p className="text-sm text-ink-muted mb-5">
              This will revoke InsightFlow's access to your QuickBooks account. Existing synced data will remain in InsightFlow.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDisconnect(false)} className="flex-1 py-2 rounded-lg border border-rim text-ink-muted text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleDisconnect} className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                Disconnect
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
