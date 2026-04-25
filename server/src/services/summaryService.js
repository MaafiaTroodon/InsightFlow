import { decimalToNumber } from '../utils/formatters.js';

const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatPercent = (value) => `${(Number(value || 0) * 100).toFixed(2)}%`;

const toNumericRow = (row) => ({
  projectName: row.projectName,
  clientName: row.clientName ?? null,
  status: row.status ?? null,
  date: row.date ? new Date(row.date).toISOString() : null,
  revenue: round(decimalToNumber(row.revenue) || 0),
  cost: round(decimalToNumber(row.cost) || 0),
  budget: row.budget === null || row.budget === undefined ? null : round(decimalToNumber(row.budget) || 0),
  profit: round(decimalToNumber(row.profit) || 0),
  margin: round(decimalToNumber(row.margin) || 0, 4),
  marginPercent: round((decimalToNumber(row.margin) || 0) * 100, 2),
  isOverBudget: Boolean(row.isOverBudget),
});

export const sanitizeRowsForDisplay = (rows = []) => rows.map(toNumericRow);

export const buildSummary = (rows = []) => {
  const totals = sanitizeRowsForDisplay(rows).reduce(
    (accumulator, row) => {
      accumulator.totalRevenue += row.revenue;
      accumulator.totalCost += row.cost;
      accumulator.totalProfit += row.profit;
      accumulator.totalMargin += row.margin;
      accumulator.projectCount += 1;
      accumulator.overBudgetCount += row.isOverBudget ? 1 : 0;
      accumulator.negativeProfitCount += row.profit < 0 ? 1 : 0;
      return accumulator;
    },
    {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalMargin: 0,
      projectCount: 0,
      overBudgetCount: 0,
      negativeProfitCount: 0,
    }
  );

  return {
    totalRevenue: round(totals.totalRevenue),
    totalCost: round(totals.totalCost),
    totalProfit: round(totals.totalProfit),
    averageMargin: totals.projectCount ? round(totals.totalMargin / totals.projectCount, 4) : 0,
    projectCount: totals.projectCount,
    overBudgetCount: totals.overBudgetCount,
    negativeProfitCount: totals.negativeProfitCount,
  };
};

export const buildChartData = (rows = []) => {
  const normalizedRows = sanitizeRowsForDisplay(rows);

  const statusCounts = normalizedRows.reduce((accumulator, row) => {
    if (!row.status) {
      return accumulator;
    }

    accumulator[row.status] = (accumulator[row.status] || 0) + 1;
    return accumulator;
  }, {});

  return {
    projectFinancials: normalizedRows.map((row) => ({
      projectName: row.projectName,
      revenue: row.revenue,
      cost: row.cost,
      profit: row.profit,
      budget: row.budget,
    })),
    statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    })),
    marginByProject: normalizedRows.map((row) => ({
      projectName: row.projectName,
      marginPercent: row.marginPercent,
    })),
  };
};

export const buildExecutiveSummary = ({ dataset, rows = [], summary }) => {
  const normalizedRows = sanitizeRowsForDisplay(rows);

  const highestRevenueProject = normalizedRows.reduce(
    (best, row) => (best === null || row.revenue > best.revenue ? row : best),
    null
  );

  const lowestMarginProject = normalizedRows.reduce(
    (best, row) => (best === null || row.margin < best.margin ? row : best),
    null
  );

  return [
    `This dataset contains ${dataset.rowCount} cleaned business records from ${dataset.originalFileName}.`,
    `Total revenue is ${formatCurrency(summary.totalRevenue)} with ${formatCurrency(summary.totalProfit)} in profit, giving an average margin of ${formatPercent(summary.averageMargin)}.`,
    `${summary.overBudgetCount} projects are over budget and ${summary.negativeProfitCount} projects have negative profit.`,
    highestRevenueProject && lowestMarginProject
      ? `${highestRevenueProject.projectName} generated the highest revenue, while ${lowestMarginProject.projectName} has the lowest margin.`
      : 'Revenue, cost, and margin trends were calculated from the cleaned business-ready rows.',
  ];
};
