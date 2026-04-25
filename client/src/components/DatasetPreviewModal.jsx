import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button.jsx';
import { DataTable } from './DataTable.jsx';
import { Modal } from './Modal.jsx';
import { formatCurrency, formatPercent } from '../utils/formatters.js';

const tabs = ['raw', 'cleaned', 'warnings', 'summary'];

export function DatasetPreviewModal({ isOpen, onClose, dataset, rawRows = [], cleanedRows = [], warnings = [], summary }) {
  const [activeTab, setActiveTab] = useState('raw');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('raw');
    }
  }, [isOpen]);

  const summaryItems = summary
    ? [
        ['Total Revenue', formatCurrency(summary.totalRevenue)],
        ['Total Cost', formatCurrency(summary.totalCost)],
        ['Total Profit', formatCurrency(summary.totalProfit)],
        ['Average Margin', formatPercent(summary.averageMargin)],
        ['Over Budget Count', summary.overBudgetCount],
        ['Negative Profit Count', summary.negativeProfitCount],
      ]
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white">{dataset?.name || 'Dataset preview'}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {dataset?.fileType || 'Dataset'} • {dataset?.rowCount || cleanedRows.length} cleaned rows
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
          Close
        </button>
      </div>

      <div className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                activeTab === tab ? 'bg-teal-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab === 'raw' ? 'Raw Data' : tab === 'cleaned' ? 'Cleaned Data' : tab === 'warnings' ? 'Warnings' : 'Summary'}
            </button>
          ))}
        </div>

        <div className="mt-5 max-h-[58vh] overflow-auto pr-1">
          {activeTab === 'raw' ? <DataTable rows={rawRows.slice(0, 10)} variant="raw" title="First 10 raw rows" /> : null}
          {activeTab === 'cleaned' ? <DataTable rows={cleanedRows.slice(0, 10)} variant="cleaned" title="First 10 cleaned rows" /> : null}
          {activeTab === 'warnings' ? (
            warnings.length ? (
              <div className="grid gap-3">
                {warnings.map((warning, index) => (
                  <article key={`${warning}-${index}`} className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-50">
                    {warning}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                No warnings were generated for this dataset.
              </div>
            )
          ) : null}
          {activeTab === 'summary' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summaryItems.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className="mt-3 text-2xl font-extrabold text-white">{value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 px-6 py-4">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {dataset?.id ? (
          <Button as={Link} to={`/dashboard/${dataset.id}`} onClick={onClose}>
            Open Dashboard Analysis
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}
