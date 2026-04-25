import { Link } from 'react-router-dom';
import { SectionHeader } from '../components/SectionHeader.jsx';

const features = [
  {
    title: 'Upload CSV/Excel',
    description: 'Support for .csv, .xlsx, and .xls with a single drag-and-drop flow.',
  },
  {
    title: 'Auto-clean data',
    description: 'Standardize columns, normalize dates, remove duplicates, and repair missing values.',
  },
  {
    title: 'Dashboard',
    description: 'Visualize revenue, cost, profit, margins, and project status in seconds.',
  },
  {
    title: 'Business insights',
    description: 'Surface simple rule-based takeaways without relying on paid AI APIs.',
  },
];

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-8 py-14 shadow-glow lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Portfolio-ready business analytics</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-extrabold tracking-tight text-white md:text-6xl">
              Turn messy business data into clear insights
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Upload CSV or Excel files, clean inconsistent business records, store them in Neon PostgreSQL, and review dashboards plus rule-based insights in a polished demo flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/upload"
                className="inline-flex rounded-full bg-teal-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
              >
                Start Analysis
              </Link>
              <Link
                to="/architecture"
                className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/5"
              >
                Explore Architecture
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-400/15 via-white/5 to-amber-400/10 p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Cleaned Rows</p>
                  <p className="mt-3 text-3xl font-extrabold text-teal-300">1,248</p>
                </article>
                <article className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Avg Margin</p>
                  <p className="mt-3 text-3xl font-extrabold text-sky-300">18.6%</p>
                </article>
                <article className="rounded-2xl bg-white/5 p-4 md:col-span-2">
                  <p className="text-sm text-slate-400">Pipeline</p>
                  <p className="mt-3 text-xl font-bold text-white">Upload → Parse → Clean → Store → Analyze → Visualize</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Features"
          title="A focused data-analysis workflow for business datasets"
          description="InsightFlow stays intentionally small: upload, clean, analyze, and present a clear dashboard without overbuilding the product."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10" />
              <h2 className="mt-5 text-xl font-bold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
