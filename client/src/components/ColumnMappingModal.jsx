import { Modal } from './Modal.jsx';

const badgeMap = {
  mapped: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  missing: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
  ignored: 'border-slate-400/20 bg-white/5 text-slate-300',
};

const standardFields = ['Project', 'Client', 'Revenue', 'Cost', 'Budget', 'Status', 'Date'];

const Badge = ({ type, label }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeMap[type]}`}>
    {label}
  </span>
);

export function ColumnMappingModal({ isOpen, onClose, columnMapping }) {
  const hasMapping =
    columnMapping &&
    (columnMapping.mapped?.length || columnMapping.ignored?.length || columnMapping.missing?.length);

  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName="max-w-3xl max-h-[90vh]">
      <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Column Mapping</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              InsightFlow normalizes messy column names into standard business fields before analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>

      <div className="max-h-[80vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        {!hasMapping ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
            Column mapping was not captured for this dataset.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Expected Standard Fields</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {standardFields.map((field) => (
                  <span key={field} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/95 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]">Original Column</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]">Normalized</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]">Mapped Field</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {columnMapping.mapped?.map((item) => (
                      <tr key={`${item.original}-${item.mappedTo}`} className="bg-slate-950/30">
                        <td className="px-4 py-3 text-slate-100">{item.original}</td>
                        <td className="px-4 py-3 text-slate-300">{item.normalized}</td>
                        <td className="px-4 py-3 text-slate-100">{item.mappedTo}</td>
                        <td className="px-4 py-3"><Badge type="mapped" label="Mapped" /></td>
                      </tr>
                    ))}
                    {columnMapping.ignored?.map((item) => (
                      <tr key={`${item.original}-${item.normalized}`} className="bg-slate-950/20">
                        <td className="px-4 py-3 text-slate-100">{item.original}</td>
                        <td className="px-4 py-3 text-slate-300">{item.normalized}</td>
                        <td className="px-4 py-3 text-slate-400">Not used in analysis</td>
                        <td className="px-4 py-3"><Badge type="ignored" label="Ignored" /></td>
                      </tr>
                    ))}
                    {columnMapping.missing?.map((field) => (
                      <tr key={field} className="bg-slate-950/10">
                        <td className="px-4 py-3 text-slate-400">-</td>
                        <td className="px-4 py-3 text-slate-400">-</td>
                        <td className="px-4 py-3 text-slate-100">{field}</td>
                        <td className="px-4 py-3"><Badge type="missing" label="Missing" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
