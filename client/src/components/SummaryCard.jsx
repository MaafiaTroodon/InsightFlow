import { Card } from './Card.jsx';

export function SummaryCard({ label, value, hint, tone = 'text-white' }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-extrabold ${tone}`}>{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}
