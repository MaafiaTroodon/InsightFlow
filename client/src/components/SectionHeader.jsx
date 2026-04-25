export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 text-base text-slate-300">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
