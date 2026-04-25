import { Card } from '../components/Card.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { ScrollReveal } from '../components/ScrollReveal.jsx';

function StepIcon({ type }) {
  const iconClassName = 'h-5 w-5 stroke-[1.8]';

  if (type === 'upload') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M12 16V4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 9L12 4L17 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 20H19" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'parse') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M8 4H14L18 8V20H8V4Z" stroke="currentColor" strokeLinejoin="round" />
        <path d="M14 4V8H18" stroke="currentColor" strokeLinejoin="round" />
        <path d="M11 12H15" stroke="currentColor" strokeLinecap="round" />
        <path d="M11 16H15" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'clean') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M6 6H18" stroke="currentColor" strokeLinecap="round" />
        <path d="M9 12H15" stroke="currentColor" strokeLinecap="round" />
        <path d="M11 18H13" stroke="currentColor" strokeLinecap="round" />
        <path d="M7 4L8 6L10 7L8 8L7 10L6 8L4 7L6 6L7 4Z" stroke="currentColor" strokeLinejoin="round" />
        <path d="M17 13L18 15L20 16L18 17L17 19L16 17L14 16L16 15L17 13Z" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'store') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <ellipse cx="12" cy="6" rx="6.5" ry="2.5" stroke="currentColor" />
        <path d="M5.5 6V12C5.5 13.4 8.4 14.5 12 14.5C15.6 14.5 18.5 13.4 18.5 12V6" stroke="currentColor" />
        <path d="M5.5 12V18C5.5 19.4 8.4 20.5 12 20.5C15.6 20.5 18.5 19.4 18.5 18V12" stroke="currentColor" />
      </svg>
    );
  }

  if (type === 'analyze') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M4 20H20" stroke="currentColor" strokeLinecap="round" />
        <path d="M7 16V11" stroke="currentColor" strokeLinecap="round" />
        <path d="M12 16V7" stroke="currentColor" strokeLinecap="round" />
        <path d="M17 16V9" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'report') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M8 4H14L18 8V20H8V4Z" stroke="currentColor" strokeLinejoin="round" />
        <path d="M14 4V8H18" stroke="currentColor" strokeLinejoin="round" />
        <path d="M12 11V16" stroke="currentColor" strokeLinecap="round" />
        <path d="M9.5 14L12 16.5L14.5 14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'react') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" stroke="currentColor" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(60 12 12)" stroke="currentColor" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(120 12 12)" stroke="currentColor" />
      </svg>
    );
  }

  if (type === 'server') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <rect x="5" y="5" width="14" height="5" rx="1.5" stroke="currentColor" />
        <rect x="5" y="14" width="14" height="5" rx="1.5" stroke="currentColor" />
        <path d="M8 7.5H8.01" stroke="currentColor" strokeLinecap="round" />
        <path d="M8 16.5H8.01" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'database') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <ellipse cx="12" cy="6" rx="6.5" ry="2.5" stroke="currentColor" />
        <path d="M5.5 6V12C5.5 13.4 8.4 14.5 12 14.5C15.6 14.5 18.5 13.4 18.5 12V6" stroke="currentColor" />
        <path d="M5.5 12V18C5.5 19.4 8.4 20.5 12 20.5C15.6 20.5 18.5 19.4 18.5 18V12" stroke="currentColor" />
      </svg>
    );
  }

  if (type === 'layers') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M12 4L20 8L12 12L4 8L12 4Z" stroke="currentColor" strokeLinejoin="round" />
        <path d="M20 12L12 16L4 12" stroke="currentColor" strokeLinejoin="round" />
        <path d="M20 16L12 20L4 16" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'spark') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'file') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path d="M8 4H14L18 8V20H8V4Z" stroke="currentColor" strokeLinejoin="round" />
        <path d="M14 4V8H18" stroke="currentColor" strokeLinejoin="round" />
        <path d="M10 12H16" stroke="currentColor" strokeLinecap="round" />
        <path d="M10 16H14" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" />
    </svg>
  );
}

const pipeline = [
  {
    step: '01',
    icon: 'upload',
    label: 'Upload',
    description: 'Accept CSV, XLSX, and XLS files through a focused drag-and-drop flow.',
    tag: 'CSV/XLSX',
  },
  {
    step: '02',
    icon: 'parse',
    label: 'Parse',
    description: 'Convert spreadsheet input into structured JSON rows using the first worksheet when needed.',
    tag: 'JSON rows',
  },
  {
    step: '03',
    icon: 'clean',
    label: 'Clean',
    description: 'Normalize dates, money, statuses, duplicates, and business field names.',
    tag: 'Cleaning rules',
  },
  {
    step: '04',
    icon: 'store',
    label: 'Store',
    description: 'Persist user-owned dataset metadata and cleaned business rows in Neon PostgreSQL.',
    tag: 'Neon DB',
  },
  {
    step: '05',
    icon: 'analyze',
    label: 'Analyze',
    description: 'Calculate financial metrics, chart data, and automated business insights.',
    tag: 'Metrics',
  },
  {
    step: '06',
    icon: 'report',
    label: 'Report',
    description: 'Render a clean business report preview and export a polished PDF.',
    tag: 'PDF export',
  },
];

const technologies = [
  {
    icon: 'react',
    title: 'React UI',
    description: 'Responsive views for upload, history, dashboard, report preview, and architecture screens.',
    badge: 'Frontend',
  },
  {
    icon: 'server',
    title: 'Express API',
    description: 'Handles file upload, parsing, cleaning, summaries, insights, and dataset endpoints.',
    badge: 'Backend',
  },
  {
    icon: 'database',
    title: 'Neon PostgreSQL',
    description: 'Stores dataset metadata and cleaned business rows with Prisma.',
    badge: 'Cloud database',
  },
  {
    icon: 'layers',
    title: 'Prisma',
    description: 'Provides a clean database layer for user-owned datasets and business rows.',
    badge: 'ORM layer',
  },
  {
    icon: 'spark',
    title: 'Rule-based Insights',
    description: 'Generates deterministic business observations without paid AI APIs.',
    badge: 'No paid AI',
  },
  {
    icon: 'file',
    title: 'PDF Export',
    description: 'Creates an on-screen business report preview and downloadable PDF.',
    badge: 'Report output',
  },
];

const dataFlow = ['Raw File', 'Parsed JSON', 'Cleaned Rows', 'Neon PostgreSQL', 'Dashboard', 'PDF Report'];

export function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <PageHeader
        eyebrow="Architecture"
        title="How InsightFlow works"
        description="A focused full-stack pipeline for CSV/XLS/XLSX upload, resilient cleaning, Neon PostgreSQL storage, automated insights, and PDF reporting."
      />

      <ScrollReveal>
        <section className="mt-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pipeline.map((step) => (
              <Card
                key={step.label}
                className="group p-5 transition duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_18px_40px_rgba(8,47,73,0.24)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Step {step.step}
                  </span>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                    <StepIcon type={step.icon} />
                  </div>
                </div>
                <h2 className="mt-5 text-2xl font-bold text-white">{step.label}</h2>
                <p className="mt-3 min-h-[3.5rem] text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
                <div className="mt-6">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-teal-200">
                    {step.tag}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <section className="mt-10">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Data Flow</p>
              <h2 className="text-2xl font-extrabold text-white">Raw input to business-ready output</h2>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {dataFlow.map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
                    {item}
                  </div>
                  {index < dataFlow.length - 1 ? (
                    <span className="hidden text-xl text-cyan-300 sm:inline-block">→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={140}>
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Technology Choices</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">The stack is intentionally small, practical, and aligned with real business reporting workflows.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {technologies.map((item) => (
              <Card
                key={item.title}
                className="group p-5 transition duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_18px_40px_rgba(8,47,73,0.24)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                    <StepIcon type={item.icon} />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <section className="mt-10 pb-8">
          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-[1.8]">
                    <path d="M12 4L18 7V12C18 16.2 15.5 18.8 12 20C8.5 18.8 6 16.2 6 12V7L12 4Z" stroke="currentColor" strokeLinejoin="round" />
                    <path d="M10 12L11.5 13.5L14.5 10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Security Note</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-white">User-scoped datasets</h2>
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Each signed-in user only sees their own uploads, dashboards, and reports. Dataset access is filtered on the backend, not only in the UI.
            </p>
          </Card>
        </section>
      </ScrollReveal>
    </div>
  );
}
