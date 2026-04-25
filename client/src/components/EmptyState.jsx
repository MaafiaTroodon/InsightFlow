import { Link } from 'react-router-dom';
import { Card } from './Card.jsx';

export function EmptyState({ title, description, actionLabel = 'Upload a dataset', actionTo = '/upload' }) {
  return (
    <Card className="border-dashed p-10 text-center">
      <h2 className="text-2xl font-extrabold text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-300">{description}</p>
      <Link
        to={actionTo}
        className="mt-6 inline-flex rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
      >
        {actionLabel}
      </Link>
    </Card>
  );
}
