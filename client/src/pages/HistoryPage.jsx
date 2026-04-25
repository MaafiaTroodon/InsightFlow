import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteDataset, fetchDatasetById, fetchDatasets } from '../api/datasets.js';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { DatasetPreviewModal } from '../components/DatasetPreviewModal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export function HistoryPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetToDelete, setDatasetToDelete] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchDatasets();
      setDatasets(response);
    } catch (loadError) {
      setError(loadError.message);
      toast.error('Could not load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async () => {
    if (!datasetToDelete) {
      return;
    }

    try {
      await deleteDataset(datasetToDelete.id);
      setDatasets((current) => current.filter((item) => item.id !== datasetToDelete.id));
      setDatasetToDelete(null);
      toast.success('Dataset deleted successfully');
    } catch (deleteError) {
      setError(deleteError.message);
      toast.error('Delete error');
    }
  };

  const handleOpenPreview = async (datasetId) => {
    try {
      const response = await fetchDatasetById(datasetId);
      setSelectedDataset(response);
    } catch (previewError) {
      toast.error(previewError.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <PageHeader
        eyebrow="History"
        title="Your datasets"
        description="Review your private uploads, inspect cleaned data, reopen dashboards, or remove datasets you no longer need."
      />

      {loading ? (
        <div className="mt-8">
          <LoadingState title="Loading history" description="Fetching your saved datasets and summary metrics." />
        </div>
      ) : error ? (
        <div className="mt-8">
          <EmptyState title="History unavailable" description={error} />
        </div>
      ) : datasets.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No datasets yet"
            description="Upload your first file to populate your private history."
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
                    {dataset.originalFileName} • Uploaded {formatDate(dataset.createdAt)} • {dataset.rowCount} cleaned rows
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

                <div className="grid gap-3 sm:flex sm:flex-wrap">
                  <Button className="w-full sm:w-auto" variant="secondary" onClick={() => handleOpenPreview(dataset.id)}>View Data</Button>
                  <Button className="w-full sm:w-auto" as={Link} to={`/dashboard/${dataset.id}`}>Open Dashboard</Button>
                  <Button className="w-full sm:w-auto" type="button" variant="danger" onClick={() => setDatasetToDelete(dataset)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DatasetPreviewModal
        isOpen={Boolean(selectedDataset)}
        onClose={() => setSelectedDataset(null)}
        dataset={selectedDataset?.dataset}
        rawRows={selectedDataset?.rawPreview || []}
        cleanedRows={selectedDataset?.cleanedPreview || selectedDataset?.rows || []}
        warnings={selectedDataset?.warnings || []}
        summary={selectedDataset?.summary}
      />

      <ConfirmModal
        isOpen={Boolean(datasetToDelete)}
        onClose={() => setDatasetToDelete(null)}
        onConfirm={handleDelete}
        title="Delete dataset"
        description={`Delete ${datasetToDelete?.name || 'this dataset'} and its cleaned rows? This action cannot be undone.`}
        confirmLabel="Delete dataset"
      />
    </div>
  );
}
