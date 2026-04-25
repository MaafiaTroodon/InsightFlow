import { Card } from './Card.jsx';

export function LoadingState({ title = 'Loading', description = 'Please wait while InsightFlow prepares your data.' }) {
  return (
    <Card className="p-10">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-300" />
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </Card>
  );
}
