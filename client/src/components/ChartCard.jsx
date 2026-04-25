import { Card } from './Card.jsx';

export function ChartCard({ title, description, children, className = '' }) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      <div className="h-[360px]">{children}</div>
    </Card>
  );
}
