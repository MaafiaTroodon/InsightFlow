import { useState } from 'react';
import { Card } from './Card.jsx';
import { DataTable } from './DataTable.jsx';

const tabs = ['raw', 'cleaned', 'warnings'];

export function PreviewTabs({ rawRows = [], cleanedRows = [], warnings = [] }) {
  const [activeTab, setActiveTab] = useState('raw');

  return (
    <Card className="p-6">
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
            {tab === 'raw' ? 'Raw Preview' : tab === 'cleaned' ? 'Cleaned Preview' : 'Warnings'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'raw' ? <DataTable rows={rawRows} variant="raw" title="First 5 parsed rows before cleaning." /> : null}
        {activeTab === 'cleaned' ? <DataTable rows={cleanedRows} variant="cleaned" title="First 5 cleaned rows prepared for storage and analysis." /> : null}
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
              No cleaning warnings were generated for this upload.
            </div>
          )
        ) : null}
      </div>
    </Card>
  );
}
