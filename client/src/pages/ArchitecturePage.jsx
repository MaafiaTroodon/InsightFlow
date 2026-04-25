import { Card } from '../components/Card.jsx';
import { PageHeader } from '../components/PageHeader.jsx';

const pipeline = [
  { label: 'Upload', description: 'CSV and Excel input via drag-and-drop upload.' },
  { label: 'Parse', description: 'Convert CSV rows or the first Excel sheet into JSON.' },
  { label: 'Clean', description: 'Normalize columns, money, dates, statuses, and duplicates.' },
  { label: 'Store', description: 'Persist cleaned rows in Neon PostgreSQL through Prisma.' },
  { label: 'Analyze', description: 'Calculate business metrics, charts, and rule-based insights.' },
  { label: 'Visualize', description: 'Render a polished React dashboard with responsive charts.' },
];

export function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <PageHeader
        eyebrow="Architecture"
        title="How InsightFlow works"
        description="A simple full-stack pipeline designed for demo clarity: file upload, resilient cleaning, PostgreSQL storage, summary analytics, and frontend visualization."
      />

      <section className="mt-8 grid gap-4 xl:grid-cols-6">
        {pipeline.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3 xl:contents">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Step {index + 1}</p>
              <h2 className="mt-3 text-xl font-bold text-white">{step.label}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
            </Card>
            {index < pipeline.length - 1 ? <span className="hidden text-center text-2xl text-teal-300 xl:block">→</span> : null}
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <h2 className="text-2xl font-extrabold text-white">System Pipeline</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {pipeline.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white">
                  {step.label}
                </div>
                {index < pipeline.length - 1 ? <span className="text-xl text-teal-300">→</span> : null}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-extrabold text-white">Technology Choices</h2>
          <div className="mt-6 grid gap-4 text-sm text-slate-300">
            <p><span className="font-bold text-white">React UI:</span> Responsive views for upload, history, architecture, and dashboard screens.</p>
            <p><span className="font-bold text-white">Express API:</span> Upload parsing, cleaning, persistence, and dataset endpoints.</p>
            <p><span className="font-bold text-white">Neon PostgreSQL:</span> Dataset metadata plus cleaned business rows stored via Prisma.</p>
            <p><span className="font-bold text-white">Rule-based insights:</span> Deterministic business observations without paid AI APIs.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
