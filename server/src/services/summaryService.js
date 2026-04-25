import { decimalToNumber } from '../utils/formatters.js';

const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

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
