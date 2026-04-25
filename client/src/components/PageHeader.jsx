export function PageHeader({ eyebrow, title, description, meta = [], actions, breadcrumb }) {
  return (
    <div className="space-y-4">
      {breadcrumb ? <p className="text-sm text-slate-400">{breadcrumb}</p> : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">{eyebrow}</p> : null}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h1>
          {description ? <p className="mt-3 text-base text-slate-300">{description}</p> : null}
          {meta.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.map((item) => (
                <div key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
