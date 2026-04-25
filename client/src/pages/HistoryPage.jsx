import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteDataset, fetchDatasets } from '../api/datasets.js';
import { EmptyState } from '../components/EmptyState.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export function HistoryPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchDatasets();
      setDatasets(response);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (datasetId) => {
    try {
      await deleteDataset(datasetId);
      setDatasets((current) => current.filter((item) => item.id !== datasetId));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeader
        eyebrow="History"
        title="Previous uploads"
        description="Review past business datasets, reopen dashboards, or remove demo data you no longer need."
      />

      {loading ? (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 text-center text-slate-300">
          Loading history...
        </section>
      ) : error ? (
        <div className="mt-8">
          <EmptyState title="History unavailable" description={error} />
        </div>
      ) : datasets.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No uploads yet"
            description="Upload your first dataset to populate the history page and generate dashboards."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {datasets.map((dataset) => (
            <article key={dataset.id} className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{dataset.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Uploaded {formatDate(dataset.createdAt)} • {dataset.rowCount} rows
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <div className="rounded-full bg-white/5 px-4 py-2 text-slate-300">
                      Revenue: {formatCurrency(dataset.summary.totalRevenue)}
                    </div>
                    <div className="rounded-full bg-white/5 px-4 py-2 text-slate-300">
                      Profit: {formatCurrency(dataset.summary.totalProfit)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/dashboard/${dataset.id}`}
                    className="inline-flex rounded-full bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
                  >
                    View Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(dataset.id)}
                    className="inline-flex rounded-full border border-rose-400/30 px-5 py-3 text-sm font-bold text-rose-200 transition hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
