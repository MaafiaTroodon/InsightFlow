export function Card({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-slate-900/70 shadow-lg shadow-slate-950/20 backdrop-blur ${className}`}>
      {children}
    </section>
  );
}
