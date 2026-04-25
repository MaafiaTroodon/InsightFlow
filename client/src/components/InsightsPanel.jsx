export function InsightsPanel({ insights = [], warnings = [] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Business Insights</h2>
          <p className="mt-1 text-sm text-slate-400">Rule-based takeaways generated from cleaned data.</p>
        </div>
        <div className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
          Rule-based
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {insights.map((insight, index) => (
          <article key={`${insight}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-200">{insight}</p>
          </article>
        ))}
      </div>

      {warnings.length ? (
        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Warnings</h3>
          <div className="mt-3 grid gap-2 text-sm text-amber-100">
            {warnings.map((warning, index) => (
              <p key={`${warning}-${index}`}>{warning}</p>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
