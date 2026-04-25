import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';
import { formatCurrency, formatDate, formatDateTime, formatPercent } from '../utils/formatters.js';

const reportColumns = [
  { key: 'projectName', label: 'Project' },
  { key: 'clientName', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'cost', label: 'Cost' },
  { key: 'budget', label: 'Budget' },
  { key: 'profit', label: 'Profit' },
  { key: 'margin', label: 'Margin' },
];

const slugify = (value = 'dataset') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'dataset';

export function ReportPreviewModal({ isOpen, onClose, data }) {
  const reportRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const metricCards = useMemo(
    () => [
      { label: 'Total Revenue', value: formatCurrency(data?.summary?.totalRevenue) },
      { label: 'Total Cost', value: formatCurrency(data?.summary?.totalCost) },
      { label: 'Total Profit', value: formatCurrency(data?.summary?.totalProfit) },
      { label: 'Average Margin', value: formatPercent(data?.summary?.averageMargin) },
      { label: 'Over Budget Count', value: data?.summary?.overBudgetCount ?? 0 },
      { label: 'Negative Profit Count', value: data?.summary?.negativeProfitCount ?? 0 },
    ],
    [data]
  );

  const handleDownload = async () => {
    if (!reportRef.current || !data) {
      return;
    }

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(imageData, 'PNG', margin, position, imageWidth, imageHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imageHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', margin, position, imageWidth, imageHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`insightflow-report-${slugify(data.dataset.name)}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName="max-w-5xl max-h-[90vh]">
      <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">PDF Report Preview</h2>
            <p className="mt-2 text-sm text-slate-400">Review the business report before downloading. This report includes executive summary, key metrics, insights, and cleaned rows.</p>
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

      <div className="max-h-[90vh] overflow-y-auto bg-slate-950/40 px-3 py-3 sm:px-6 sm:py-6">
        <div ref={reportRef} className="mx-auto w-full max-w-[880px] rounded-3xl bg-white p-4 text-slate-900 shadow-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-600">InsightFlow</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">{data?.dataset?.name}</h3>
              <p className="mt-2 text-sm text-slate-600">Business analytics demo report</p>
            </div>
            <div className="grid gap-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Original file:</span> {data?.dataset?.originalFileName}</p>
              <p><span className="font-semibold text-slate-900">Upload date:</span> {formatDateTime(data?.dataset?.createdAt)}</p>
              <p><span className="font-semibold text-slate-900">Row count:</span> {data?.dataset?.rowCount} cleaned rows</p>
            </div>
          </div>

          <section className="mt-8">
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-bold text-slate-950">Executive Summary</h4>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Rule-based</span>
            </div>
            <div className="mt-4 space-y-3">
              {(data?.executiveSummary || []).map((line) => (
                <p key={line} className="text-sm leading-7 text-slate-700">
                  {line}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h4 className="text-xl font-bold text-slate-950">Summary Metrics</h4>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {metricCards.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h4 className="text-xl font-bold text-slate-950">Business Insights</h4>
            <div className="mt-4 space-y-3">
              {(data?.insights || []).map((insight, index) => (
                <div key={`${insight.label}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{insight.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{insight.message}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h4 className="text-xl font-bold text-slate-950">Cleaned Rows Preview</h4>
            <p className="mt-2 text-sm text-slate-600">First 10 cleaned business-ready rows.</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      {reportColumns.map((column) => (
                        <th key={column.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(data?.rows || []).slice(0, 10).map((row, rowIndex) => (
                      <tr key={`${row.projectName}-${rowIndex}`} className="bg-white">
                        <td className="px-4 py-3 text-slate-900">{row.projectName}</td>
                        <td className="px-4 py-3 text-slate-700">{row.clientName || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{row.status || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(row.date)}</td>
                        <td className="px-4 py-3 text-slate-900">{formatCurrency(row.revenue)}</td>
                        <td className="px-4 py-3 text-slate-900">{formatCurrency(row.cost)}</td>
                        <td className="px-4 py-3 text-slate-900">{row.budget === null ? '-' : formatCurrency(row.budget)}</td>
                        <td className="px-4 py-3 text-slate-900">{formatCurrency(row.profit)}</td>
                        <td className="px-4 py-3 text-slate-900">{formatPercent(row.margin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-white/10 bg-slate-900/95 px-4 py-4 backdrop-blur sm:flex-row sm:flex-wrap sm:justify-end sm:px-6">
        <Button className="w-full sm:w-auto" variant="secondary" onClick={onClose}>Close</Button>
        <Button className="w-full sm:w-auto" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? 'Preparing PDF...' : 'Download PDF'}
        </Button>
      </div>
    </Modal>
  );
}
