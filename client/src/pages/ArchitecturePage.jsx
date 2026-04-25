import { SectionHeader } from '../components/SectionHeader.jsx';

const pipeline = ['Upload', 'Parse', 'Clean', 'Store', 'Analyze', 'Visualize'];

export function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeader
        eyebrow="Architecture"
        title="How InsightFlow works"
        description="A simple full-stack pipeline designed for demo clarity: file upload, resilient cleaning, PostgreSQL storage, summary analytics, and frontend visualization."
      />

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {pipeline.map((step, index) => (
            <div key={step} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Step {index + 1}</p>
              <h2 className="mt-3 text-xl font-bold text-white">{step}</h2>
              <p className="mt-3 text-sm text-slate-300">
                {step === 'Upload' && 'Drag in a CSV or Excel file from local storage.'}
                {step === 'Parse' && 'Detect CSV/XLS/XLSX and convert the first sheet into JSON rows.'}
                {step === 'Clean' && 'Normalize headers, fix values, compute metrics, and remove duplicates.'}
                {step === 'Store' && 'Persist the dataset plus cleaned business rows in Neon PostgreSQL.'}
                {step === 'Analyze' && 'Calculate summary metrics, chart series, and rule-based insights.'}
                {step === 'Visualize' && 'Render the dashboard, history list, and portfolio-ready UI.'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
          <h2 className="text-2xl font-extrabold text-white">System Pipeline</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            {pipeline.map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white">
                  {step}
                </div>
                {index < pipeline.length - 1 ? <span className="text-xl text-teal-300">→</span> : null}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
          <h2 className="text-2xl font-extrabold text-white">Technology Choices</h2>
          <div className="mt-6 grid gap-4 text-sm text-slate-300">
            <p><span className="font-bold text-white">Frontend:</span> React, Vite, Tailwind CSS, Recharts</p>
            <p><span className="font-bold text-white">Backend:</span> Node.js, Express, Multer</p>
            <p><span className="font-bold text-white">Database:</span> Neon PostgreSQL with Prisma ORM</p>
            <p><span className="font-bold text-white">Parsing:</span> `csv-parse` for CSV and `xlsx` for Excel</p>
            <p><span className="font-bold text-white">Insights:</span> Rule-based analytics, no paid AI dependency</p>
          </div>
        </article>
      </section>
    </div>
  );
}
