import { Link } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { PageHeader } from '../components/PageHeader.jsx';

const features = [
  {
    title: 'Upload CSV/Excel',
    description: 'Support for .csv, .xlsx, and .xls with a single drag-and-drop flow.',
    accent: 'from-teal-400/25 via-cyan-400/10 to-transparent',
    visual: 'upload',
  },
  {
    title: 'Auto-clean data',
    description: 'Standardize columns, normalize dates, remove duplicates, and repair missing values.',
    accent: 'from-sky-400/20 via-white/5 to-transparent',
    visual: 'clean',
  },
  {
    title: 'Dashboard',
    description: 'Visualize revenue, cost, profit, margins, and project status in seconds.',
    accent: 'from-amber-400/25 via-orange-400/10 to-transparent',
    visual: 'dashboard',
  },
  {
    title: 'Business insights',
    description: 'Surface simple rule-based takeaways without relying on paid AI APIs.',
    accent: 'from-emerald-400/20 via-teal-400/10 to-transparent',
    visual: 'insight',
  },
];

function FeatureVisual({ type }) {
  if (type === 'upload') {
    return (
      <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/15 to-transparent" />
        <div className="relative flex h-full flex-col justify-between rounded-xl border border-dashed border-white/15 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-400/15 text-xl text-teal-300">↑</div>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-white/10" />
            <div className="h-2 w-2/3 rounded-full bg-teal-300/60" />
            <div className="flex gap-2">
              <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-300">CSV</span>
              <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-300">XLSX</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'clean') {
    return (
      <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-transparent" />
        <div className="relative grid h-full grid-cols-[1.1fr_0.9fr] gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="h-2 w-20 rounded-full bg-white/10" />
            <div className="mt-4 grid gap-2">
              <div className="h-8 rounded-lg bg-rose-400/15" />
              <div className="h-8 rounded-lg bg-amber-400/15" />
              <div className="h-8 rounded-lg bg-emerald-400/15" />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <div className="rounded-xl bg-emerald-400/15 p-3 text-xs font-semibold text-emerald-200">Dates normalized</div>
            <div className="rounded-xl bg-sky-400/15 p-3 text-xs font-semibold text-sky-200">Duplicates removed</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent" />
        <div className="relative grid h-full gap-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="h-2 rounded-full bg-white/10" />
              <div className="mt-3 h-5 w-10 rounded-full bg-teal-300/60" />
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="h-2 rounded-full bg-white/10" />
              <div className="mt-3 h-5 w-8 rounded-full bg-sky-300/60" />
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="h-2 rounded-full bg-white/10" />
              <div className="mt-3 h-5 w-12 rounded-full bg-amber-300/60" />
            </div>
          </div>
          <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="h-8 w-1/5 rounded-t-lg bg-teal-400/70" />
            <div className="h-12 w-1/5 rounded-t-lg bg-cyan-400/70" />
            <div className="h-6 w-1/5 rounded-t-lg bg-sky-400/70" />
            <div className="h-14 w-1/5 rounded-t-lg bg-amber-400/70" />
            <div className="h-10 w-1/5 rounded-t-lg bg-emerald-400/70" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent" />
      <div className="relative grid h-full gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-emerald-400/15 p-3 text-xs font-semibold text-emerald-200">Healthy margin</div>
          <div className="rounded-xl bg-amber-400/15 p-3 text-xs font-semibold text-amber-100">1 warning</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Insight</div>
          <div className="mt-3 h-2 rounded-full bg-white/10" />
          <div className="mt-2 h-2 w-4/5 rounded-full bg-white/10" />
          <div className="mt-4 rounded-full bg-teal-400/15 px-3 py-2 text-xs font-semibold text-teal-200">
            Project Alpha leads revenue
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-8 py-12 shadow-glow lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Portfolio-ready business analytics</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              Turn messy business data into clear insights
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Upload CSV or Excel files, clean inconsistent business records, store them in Neon PostgreSQL, and review dashboards plus rule-based insights in a polished demo flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button as={Link} to="/upload" className="px-6 py-3">Start Analysis</Button>
              <Button as={Link} to="/architecture" variant="secondary" className="px-6 py-3">Explore Architecture</Button>
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
        <PageHeader
          eyebrow="Features"
          title="A focused data-analysis workflow for business datasets"
          description="InsightFlow stays intentionally small: upload, clean, analyze, and present a clear dashboard without overbuilding the product."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="group flex h-full flex-col overflow-hidden p-0">
              <div className={`bg-gradient-to-br ${feature.accent} p-5`}>
                <FeatureVisual type={feature.visual} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 h-11 w-11 rounded-2xl bg-teal-500/10 ring-1 ring-teal-400/10 transition group-hover:scale-105 group-hover:bg-teal-500/15" />
              <h2 className="mt-5 text-xl font-bold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 pb-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">What Happens Next</p>
                <h2 className="mt-3 text-3xl font-extrabold text-white">From file upload to a client-ready business readout</h2>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  InsightFlow is built for the moment right after a spreadsheet lands in your inbox. Upload the file, clean the messy fields, inspect the repaired rows, and move into a dashboard that feels presentation-ready.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step</p>
                    <p className="mt-2 text-lg font-bold text-white">Inspect</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step</p>
                    <p className="mt-2 text-lg font-bold text-white">Analyze</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step</p>
                    <p className="mt-2 text-lg font-bold text-white">Share</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dataset snapshot</p>
                        <p className="mt-2 text-xl font-bold text-white">Quarterly Services Pipeline</p>
                      </div>
                      <span className="rounded-full bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-200">Ready</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Revenue</p>
                        <p className="mt-2 text-lg font-bold text-emerald-300">$128k</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Profit</p>
                        <p className="mt-2 text-lg font-bold text-teal-300">$34k</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Margin</p>
                        <p className="mt-2 text-lg font-bold text-sky-300">26.5%</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Revenue trend</p>
                        <div className="mt-4 flex h-28 items-end gap-2">
                          <div className="h-14 flex-1 rounded-t-xl bg-slate-700" />
                          <div className="h-20 flex-1 rounded-t-xl bg-cyan-500/70" />
                          <div className="h-16 flex-1 rounded-t-xl bg-sky-500/70" />
                          <div className="h-24 flex-1 rounded-t-xl bg-teal-400/80" />
                          <div className="h-28 flex-1 rounded-t-xl bg-emerald-400/80" />
                        </div>
                      </div>
                      <div className="w-40 rounded-2xl bg-teal-500/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Insight</p>
                        <p className="mt-3 text-sm leading-6 text-slate-200">Two projects are over budget, but overall margin still looks healthy.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Why It Feels Useful</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">A small product surface with strong presentation value</h2>
            <div className="mt-6 grid gap-4">
              <article className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Professional upload review</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Review raw rows, cleaned rows, warnings, and a summary in one controlled modal instead of a cluttered page.
                </p>
              </article>
              <article className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Private dataset history</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Keep uploads scoped to the signed-in user and reopen dashboards without exposing internal storage details.
                </p>
              </article>
              <article className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Analysis that reads cleanly</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Financial charts, status breakdowns, and rule-based insights make the app feel like a focused analytics product instead of a database viewer.
                </p>
              </article>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
