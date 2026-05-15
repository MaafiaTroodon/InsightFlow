export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default:  'bg-slate-800 text-slate-300 border border-slate-700/50',
    brand:    'bg-brand-500/12 text-brand-400 border border-brand-500/20',
    success:  'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20',
    warning:  'bg-amber-500/12 text-amber-400 border border-amber-500/20',
    danger:   'bg-rose-500/12 text-rose-400 border border-rose-500/20',
    info:     'bg-sky-500/12 text-sky-400 border border-sky-500/20',
    gold:     'bg-gold-500/12 text-gold-400 border border-gold-500/20',
    violet:   'bg-violet-500/12 text-violet-400 border border-violet-500/20',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function RiskBadge({ risk }) {
  const map = { low: 'success', medium: 'warning', high: 'danger', critical: 'danger' };
  return <Badge variant={map[risk?.toLowerCase()] || 'default'}>{risk}</Badge>;
}

export function StatusBadge({ status }) {
  const map = {
    'Active':     'brand',
    'On Track':   'success',
    'Delayed':    'warning',
    'At Risk':    'danger',
    'Completed':  'default',
    'On Hold':    'gold',
    'Cancelled':  'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
}
