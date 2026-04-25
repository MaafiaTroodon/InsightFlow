import { Card } from './Card.jsx';

export function ExecutiveSummaryCard({ lines = [] }) {
  if (!lines.length) {
    return null;
  }

  return (
    <Card className="mt-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white">Executive Summary</h2>
            <span className="inline-flex rounded-full border border-teal-400/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-200">
              Auto-generated
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">A compact business readout generated from cleaned rows, summary metrics, and project insights.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {lines.slice(0, 4).map((line) => (
          <div key={line} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-7 text-slate-200">
            {line}
          </div>
        ))}
      </div>
    </Card>
  );
}
