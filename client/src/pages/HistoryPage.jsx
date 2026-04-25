import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteDataset, fetchDatasets } from '../api/datasets.js';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
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
      const shouldDelete = window.confirm('Delete this dataset and its cleaned rows?');
      if (!shouldDelete) {
        return;
      }
      await deleteDataset(datasetId);
      setDatasets((current) => current.filter((item) => item.id !== datasetId));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6">
      <PageHeader
        eyebrow="History"
        title="Previous uploads"
        description="Review past business datasets, reopen dashboards, or remove demo data you no longer need."
      />

      {loading ? (
        <div className="mt-8">
          <LoadingState title="Loading history" description="Fetching saved datasets and summary metrics." />
        </div>
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
            <Card key={dataset.id} className="p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{dataset.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {dataset.originalFileName} • Uploaded {formatDate(dataset.createdAt)} • {dataset.rowCount} rows
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
                  <Button as={Link} to={`/dashboard/${dataset.id}`}>View Dashboard</Button>
                  <Button type="button" variant="danger" onClick={() => handleDelete(dataset.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
