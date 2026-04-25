const toneMap = {
  Completed: 'bg-emerald-500/15 text-emerald-300',
  Active: 'bg-sky-500/15 text-sky-300',
  Pending: 'bg-amber-500/15 text-amber-200',
};

export function StatusBadge({ status }) {
  if (!status) {
    return <span className="inline-flex rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">Unknown</span>;
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneMap[status] || 'bg-white/5 text-slate-300'}`}>
      {status}
    </span>
  );
}
