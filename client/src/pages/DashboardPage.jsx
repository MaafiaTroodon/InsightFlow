import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchDatasetById } from '../api/datasets.js';
import { Button } from '../components/Button.jsx';
import { ChartCard } from '../components/ChartCard.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { InsightCard } from '../components/InsightCard.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { SummaryCard } from '../components/SummaryCard.jsx';
import { formatCurrency, formatDate, formatPercent, truncateText } from '../utils/formatters.js';

const pieColors = ['#2dd4bf', '#38bdf8', '#f59e0b', '#fb7185'];

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
      <div className="mx-auto max-w-7xl px-6">
        <LoadingState title="Loading dashboard" description="Fetching summary metrics, chart data, and cleaned rows." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <EmptyState title="Dashboard unavailable" description={error} actionLabel="Back to upload" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <EmptyState
          title="No dataset selected"
          description="Upload a business dataset first to generate a dashboard and insights."
        />
      </div>
    );
  }

  const summaryCards = [
    { label: 'Total Revenue', value: formatCurrency(data.summary.totalRevenue), tone: 'text-emerald-300' },
    { label: 'Total Cost', value: formatCurrency(data.summary.totalCost), tone: 'text-amber-200' },
    { label: 'Total Profit', value: formatCurrency(data.summary.totalProfit), tone: data.summary.totalProfit >= 0 ? 'text-teal-300' : 'text-rose-300' },
    { label: 'Average Margin', value: formatPercent(data.summary.averageMargin), tone: 'text-sky-300' },
    { label: 'Projects', value: data.summary.projectCount, tone: 'text-violet-300' },
    { label: 'Over Budget', value: data.summary.overBudgetCount, tone: 'text-rose-200' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6">
      <PageHeader
        eyebrow="Dashboard"
        title={data.dataset.name}
        breadcrumb="Uploads / Dashboard"
        description="A cleaned business dataset with summary metrics, charted financials, and rule-based analysis."
        meta={[
          data.dataset.originalFileName,
          `Uploaded ${formatDate(data.dataset.createdAt)}`,
          `${data.dataset.rowCount} cleaned rows`,
        ]}
        actions={
          <>
            <Button as={Link} variant="secondary" to="/history">View History</Button>
            <Button as={Link} to="/upload">Upload New</Button>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <ChartCard title="Revenue vs Cost" description="Side-by-side project comparison for top-line value and spend." className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData.projectFinancials}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="projectName" tickFormatter={(value) => truncateText(value, 10)} angle={-25} textAnchor="end" height={70} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Breakdown" description="Distribution of standardized project statuses.">
          {data.chartData.statusBreakdown.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.chartData.statusBreakdown} dataKey="count" nameKey="status" innerRadius={65} outerRadius={110}>
                  {data.chartData.statusBreakdown.map((entry, index) => (
                    <Cell key={entry.status} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
              No status data was available for this dataset.
            </div>
          )}
        </ChartCard>

        <ChartCard title="Profit by Project" description="Project-level contribution to total profitability." className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData.projectFinancials}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="projectName" tickFormatter={(value) => truncateText(value, 10)} angle={-25} textAnchor="end" height={70} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="profit" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Margin by Project" description="Margin percent after cost normalization and cleaning.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData.marginByProject}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="projectName" tickFormatter={(value) => truncateText(value, 10)} angle={-25} textAnchor="end" height={70} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="marginPercent" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <DataTable
          rows={data.rows.slice(0, 10)}
          variant="cleaned"
          title="Cleaned Rows"
          subtitle="Showing the first 10 cleaned rows. Internal storage fields are hidden from the product UI."
        />
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">Business Insights</h2>
            <p className="mt-1 text-sm text-slate-400">Rule-based observations generated from the cleaned dataset.</p>
          </div>
          <div className="grid max-h-[600px] gap-4 overflow-y-auto pr-1">
            {data.insights.map((insight, index) => (
              <InsightCard key={`${insight.label}-${index}`} insight={insight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
