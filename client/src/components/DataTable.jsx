import { formatCurrency, formatDate, formatPercent } from '../utils/formatters.js';
import { BudgetBadge } from './BudgetBadge.jsx';
import { Card } from './Card.jsx';
import { StatusBadge } from './StatusBadge.jsx';

const cleanedColumns = [
  { key: 'projectName', label: 'Project' },
  { key: 'clientName', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'cost', label: 'Cost' },
  { key: 'budget', label: 'Budget' },
  { key: 'profit', label: 'Profit' },
  { key: 'margin', label: 'Margin' },
  { key: 'isOverBudget', label: 'Over Budget' },
];

export function DataTable({ rows = [], variant = 'cleaned', title, subtitle }) {
  if (!rows.length) {
    return (
      <Card className="p-6">
        {title ? <h2 className="text-lg font-bold text-white">{title}</h2> : null}
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
          No rows available.
        </div>
      </Card>
    );
  }

  const rawColumns = Object.keys(rows[0]);
  const columns = variant === 'raw' ? rawColumns.map((key) => ({ key, label: key })) : cleanedColumns;

  const renderCell = (row, key) => {
    if (variant === 'raw') {
      const value = row[key];
      return value === null || value === undefined || value === '' ? '-' : String(value);
    }

    if (key === 'status') {
      return <StatusBadge status={row.status} />;
    }

    if (key === 'isOverBudget') {
      return <BudgetBadge isOverBudget={row.isOverBudget} />;
    }

    if (key === 'date') {
      return formatDate(row.date);
    }

    if (['revenue', 'cost', 'budget', 'profit'].includes(key)) {
      return row[key] === null ? '-' : formatCurrency(row[key]);
    }

    if (key === 'margin') {
      return formatPercent(row.margin);
    }

    return row[key] || '-';
  };

  return (
    <Card className="p-6">
      {title ? <h2 className="text-lg font-bold text-white">{title}</h2> : null}
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-950/95 text-slate-300 backdrop-blur">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 font-semibold uppercase tracking-[0.12em] text-xs whitespace-nowrap">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, rowIndex) => (
                <tr key={`${variant}-${row.projectName || 'row'}-${rowIndex}`} className="bg-slate-950/30">
                  {columns.map((column) => (
                    <td
                      key={`${column.key}-${rowIndex}`}
                      className={`px-4 py-3 align-middle whitespace-nowrap ${
                        variant === 'cleaned' && column.key === 'profit'
                          ? row.profit >= 0
                            ? 'font-semibold text-emerald-300'
                            : 'font-semibold text-rose-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {renderCell(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
