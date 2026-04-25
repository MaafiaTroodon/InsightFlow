import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDatasetById } from '../api/datasets.js';
import { ChartsPanel } from '../components/ChartsPanel.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { InsightsPanel } from '../components/InsightsPanel.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { SummaryCards } from '../components/SummaryCards.jsx';
import { formatDate } from '../utils/formatters.js';

export function DashboardPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDataset = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchDatasetById(id);
        setData(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 text-center text-slate-300">
          Loading dashboard...
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <EmptyState title="Dashboard unavailable" description={error} actionLabel="Back to upload" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <EmptyState
          title="No dataset selected"
          description="Upload a business dataset first to generate a dashboard and insights."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeader
        eyebrow="Dashboard"
        title={data.dataset.name}
        description={`Uploaded ${formatDate(data.dataset.createdAt)} from ${data.dataset.originalFileName}. Cleaned ${data.dataset.rowCount} rows for analysis.`}
      />

      <div className="mt-8">
        <SummaryCards summary={data.summary} />
      </div>

      <div className="mt-8">
        <ChartsPanel charts={data.charts} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DataTable
          rows={data.rows.slice(0, 10)}
          title="Cleaned Data Preview"
          description="Preview of cleaned rows stored in PostgreSQL after standardization and calculations."
        />
        <InsightsPanel insights={data.insights} warnings={data.warnings || []} />
      </div>
    </div>
  );
}
