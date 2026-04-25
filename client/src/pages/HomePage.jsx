import { Link } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { ScrollReveal } from '../components/ScrollReveal.jsx';

const features = [
  {
    title: 'Upload CSV/Excel',
    description: 'Support for .csv, .xlsx, and .xls with a single drag-and-drop flow.',
    accent: 'from-teal-400/25 via-cyan-400/10 to-transparent',
    visual: 'upload',
  },
  {
    title: 'Auto-clean data',
    description: 'Normalize dates, repair missing values, remove duplicates, and standardize business fields.',
    accent: 'from-sky-400/20 via-white/5 to-transparent',
    visual: 'clean',
  },
  {
    title: 'Dashboard analysis',
    description: 'Visualize revenue, cost, profit, margin, project status, and risk signals.',
    accent: 'from-amber-400/25 via-orange-400/10 to-transparent',
    visual: 'dashboard',
  },
  {
    title: 'PDF report export',
    description: 'Preview a clean business report on-screen and download it as a polished PDF.',
    accent: 'from-emerald-400/20 via-teal-400/10 to-transparent',
    visual: 'report',
  },
  {
    title: 'Private history',
    description: 'Each signed-in user only sees their own datasets, reports, and dashboards.',
    accent: 'from-violet-400/20 via-white/5 to-transparent',
    visual: 'history',
  },
  {
    title: 'Column mapping',
    description: 'Review how messy spreadsheet columns are mapped into clean business-ready fields.',
    accent: 'from-cyan-400/20 via-white/5 to-transparent',
    visual: 'mapping',
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

  if (type === 'report') {
    return (
      <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent" />
        <div className="relative grid h-full gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Report</span>
              <span className="rounded-full bg-teal-100 px-2 py-1 text-[10px] font-semibold text-teal-700">PDF</span>
            </div>
            <div className="mt-3 h-2 w-24 rounded-full bg-slate-200" />
            <div className="mt-2 h-2 w-3/4 rounded-full bg-slate-200" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="h-9 rounded-lg bg-slate-100" />
              <div className="h-9 rounded-lg bg-slate-100" />
              <div className="h-9 rounded-lg bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3">
            <span className="text-xs font-semibold text-slate-300">Preview on-screen</span>
            <span className="rounded-full bg-teal-500/15 px-3 py-1 text-[10px] font-semibold text-teal-200">Download PDF</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'history') {
    return (
      <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-transparent" />
        <div className="relative grid h-full gap-3">
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3">
              <div>
                <div className="h-2 w-20 rounded-full bg-white/10" />
                <div className="mt-2 h-2 w-28 rounded-full bg-white/10" />
              </div>
              <div className="rounded-full bg-teal-500/15 px-3 py-1 text-[10px] font-semibold text-teal-200">Private</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent" />
      <div className="relative grid h-full gap-2">
        {[
          ['project_name', 'Project'],
          ['invoice_amount', 'Revenue'],
          ['state', 'Status'],
        ].map(([left, right]) => (
          <div key={left} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs">
            <span className="truncate text-slate-300">{left}</span>
            <span className="text-teal-300">→</span>
            <span className="truncate font-semibold text-white">{right}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <ScrollReveal>
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-4 py-8 shadow-glow sm:px-8 sm:py-10 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Portfolio-ready business analytics</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                Turn messy business data into clear insights
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Upload CSV or Excel files, clean inconsistent business records, store them securely, generate dashboards, and export polished PDF reports.
              </p>
              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <Button as={Link} to="/upload" className="w-full px-6 py-3 sm:w-auto">Start Analysis</Button>
                <Button as={Link} to="/architecture" variant="secondary" className="w-full px-6 py-3 sm:w-auto">View Report Workflow</Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-400/15 via-white/5 to-amber-400/10 p-4 sm:p-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 sm:p-6">
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
                    <p className="mt-3 text-lg font-bold text-white sm:text-xl">Upload → Parse → Clean → Store → Analyze → Report</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <section className="mt-16">
        <PageHeader
          eyebrow="Features"
          title="A focused data-analysis workflow for business datasets"
          description="InsightFlow stays intentionally small: upload, clean, analyze, present a clear dashboard, and export a polished PDF report without overbuilding the product."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 90}>
              <Card className="group flex h-full min-h-[24rem] flex-col overflow-hidden p-0">
                <div className={`bg-gradient-to-br ${feature.accent} p-4 sm:p-5`}>
                  <FeatureVisual type={feature.visual} />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h2 className="text-2xl font-bold text-white sm:text-[1.55rem]">{feature.title}</h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-300 sm:text-[15px]">
                    {feature.description}
                  </p>
                  <div className="mt-auto pt-5 text-xs font-semibold uppercase tracking-[0.24em] text-teal-300/90">
                    Focused workflow
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <ScrollReveal>
          <Card className="overflow-hidden p-5 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Report Workflow</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">From spreadsheet to downloadable report</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Move from messy spreadsheet input to a polished report preview and downloadable PDF without leaving the product flow.
            </p>
            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {[
                'Upload CSV/Excel',
                'Clean and standardize rows',
                'Review dashboard insights',
                'Preview report',
                'Download PDF',
              ].map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Step {index + 1}</p>
                  <p className="mt-3 text-lg font-bold text-white">{step}</p>
                </div>
              ))}
            </div>
          </Card>
        </ScrollReveal>
      </section>

      <section className="mt-16 pb-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal>
            <Card className="overflow-hidden p-5 sm:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">What Happens Next</p>
                  <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                    From file upload to a client-ready business readout
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-8 text-slate-300">
                    InsightFlow is built for the moment right after a spreadsheet lands in your inbox. Upload the file, clean the messy fields, inspect the repaired rows, move into the dashboard, and export a report that is ready to share.
                  </p>
                  <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                    <div className="min-w-[9rem] rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Step 1</p>
                      <p className="mt-2 text-xl font-bold text-white">Inspect</p>
                    </div>
                    <div className="min-w-[9rem] rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Step 2</p>
                      <p className="mt-2 text-xl font-bold text-white">Analyze</p>
                    </div>
                    <div className="min-w-[9rem] rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Step 3</p>
                      <p className="mt-2 text-xl font-bold text-white">Download</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4 sm:p-5">
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dataset snapshot</p>
                          <p className="mt-2 text-xl font-bold text-white sm:text-[1.7rem]">Quarterly Services Pipeline</p>
                        </div>
                        <span className="self-start rounded-full bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-200">Ready</span>
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
                      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr] lg:items-end">
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
                        <div className="rounded-2xl bg-teal-500/10 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Report ready</p>
                          <p className="mt-3 text-sm leading-6 text-slate-200">Preview the business summary on-screen, then export a clean PDF for review or handoff.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <Card className="p-5 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Why It Feels Useful</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                A small product surface with strong presentation value
              </h2>
              <div className="mt-6 grid gap-4">
                <article className="rounded-2xl bg-white/5 p-5">
                  <p className="text-base font-semibold text-white">Professional upload review</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Review raw rows, cleaned rows, warnings, and a summary in one controlled modal instead of a cluttered page.
                  </p>
                </article>
                <article className="rounded-2xl bg-white/5 p-5">
                  <p className="text-base font-semibold text-white">Private dataset history</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Keep uploads scoped to the signed-in user and reopen dashboards without exposing internal storage details.
                  </p>
                </article>
                <article className="rounded-2xl bg-white/5 p-5">
                  <p className="text-base font-semibold text-white">Report preview and download</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Turn cleaned rows, executive summary, metrics, and insights into a clean PDF report preview before downloading.
                  </p>
                </article>
                <article className="rounded-2xl bg-white/5 p-5">
                  <p className="text-base font-semibold text-white">Analysis that reads cleanly</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Financial charts, status breakdowns, and automated business insights make the app feel like a focused analytics product instead of a database viewer.
                  </p>
                </article>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
