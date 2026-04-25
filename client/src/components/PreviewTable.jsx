export function PreviewTable({ title, rows, kind = 'raw' }) {
  if (!rows?.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
          No preview available.
        </div>
      </section>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">
        {kind === 'raw' ? 'First 5 parsed rows before cleaning.' : 'First 5 rows after cleaning rules were applied.'}
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 text-left font-semibold capitalize text-slate-300">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`} className="bg-slate-950/30">
                  {columns.map((column) => (
                    <td key={`${column}-${rowIndex}`} className="px-4 py-3 text-slate-300">
                      {row[column] === null || row[column] === undefined || row[column] === ''
                        ? '-'
                        : typeof row[column] === 'object'
                          ? JSON.stringify(row[column])
                          : String(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
