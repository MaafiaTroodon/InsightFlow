import { Card } from './Card.jsx';

const toneMap = {
  positive: 'border-l-4 border-l-emerald-400',
  warning: 'border-l-4 border-l-amber-400',
  danger: 'border-l-4 border-l-rose-400',
  neutral: 'border-l-4 border-l-slate-500',
};

const dotMap = {
  positive: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  neutral: 'bg-slate-400',
};

export function InsightCard({ insight }) {
  return (
    <Card className={`p-4 ${toneMap[insight.type] || toneMap.neutral}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotMap[insight.type] || dotMap.neutral}`} />
        <div>
          <p className="text-sm font-semibold text-white">{insight.label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{insight.message}</p>
        </div>
      </div>
    </Card>
  );
}
