export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="skeleton h-3 w-24 rounded-full" />
      <div className="skeleton h-7 w-32 rounded-lg" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <div key={i} className={`skeleton h-2 rounded-full ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`} />
      ))}
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5 flex-1">
          <div className="skeleton h-2.5 w-20 rounded-full" />
          <div className="skeleton h-7 w-28 rounded-lg" />
          <div className="skeleton h-2 w-24 rounded-full" />
        </div>
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonChart({ height = 280 }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="space-y-2 mb-4">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="skeleton h-2 w-44 rounded-full" />
      </div>
      <div className="skeleton rounded-xl" style={{ height }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/[0.07]">
        <div className="skeleton h-3 w-28 rounded-full" />
      </div>
      <div className="divide-y divide-white/[0.05]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="skeleton h-8 w-8 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-2.5 w-36 rounded-full" />
              <div className="skeleton h-2 w-24 rounded-full" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="skeleton h-8 w-8 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-2.5 w-36 rounded-full" />
        <div className="skeleton h-2 w-24 rounded-full" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  );
}
