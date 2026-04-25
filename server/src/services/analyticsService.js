import { decimalToNumber, formatCurrency, formatPercent } from '../utils/formatters.js';

const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

export const buildSummary = (rows = []) => {
  const totals = rows.reduce(
    (accumulator, row) => {
      const revenue = decimalToNumber(row.revenue) || 0;
      const cost = decimalToNumber(row.cost) || 0;
      const profit = decimalToNumber(row.profit) || 0;
      const margin = decimalToNumber(row.margin) || 0;

      accumulator.totalRevenue += revenue;
      accumulator.totalCost += cost;
      accumulator.totalProfit += profit;
      accumulator.totalMargin += margin;
      accumulator.projectCount += 1;
      accumulator.overBudgetCount += row.isOverBudget ? 1 : 0;

      return accumulator;
    },
    {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalMargin: 0,
      projectCount: 0,
      overBudgetCount: 0,
    }
  );

  return {
    totalRevenue: round(totals.totalRevenue),
    totalCost: round(totals.totalCost),
    totalProfit: round(totals.totalProfit),
    averageMargin: totals.projectCount ? round(totals.totalMargin / totals.projectCount, 4) : 0,
    projectCount: totals.projectCount,
    overBudgetCount: totals.overBudgetCount,
  };
};

export const buildChartData = (rows = []) => {
  const projectFinancials = rows.map((row) => ({
    projectName: row.projectName,
    revenue: round(decimalToNumber(row.revenue) || 0),
    cost: round(decimalToNumber(row.cost) || 0),
    profit: round(decimalToNumber(row.profit) || 0),
  }));

  const statusMap = rows.reduce((accumulator, row) => {
    if (!row.status) {
      return accumulator;
    }

    accumulator[row.status] = (accumulator[row.status] || 0) + 1;
    return accumulator;
  }, {});

  return {
    revenueVsCost: projectFinancials,
    profitByProject: projectFinancials.map(({ projectName, profit }) => ({ projectName, profit })),
    statusBreakdown: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
  };
};

export const buildInsights = (rows = [], summary, warnings = []) => {
  if (!rows.length) {
    return ['No rows were available after cleaning, so there are no business insights to display yet.'];
  }

  const numericRows = rows.map((row) => ({
    ...row,
    revenueValue: decimalToNumber(row.revenue) || 0,
    costValue: decimalToNumber(row.cost) || 0,
    profitValue: decimalToNumber(row.profit) || 0,
    marginValue: decimalToNumber(row.margin) || 0,
  }));

  const highestRevenue = [...numericRows].sort((a, b) => b.revenueValue - a.revenueValue)[0];
  const highestCost = [...numericRows].sort((a, b) => b.costValue - a.costValue)[0];
  const lowestMargin = [...numericRows].sort((a, b) => a.marginValue - b.marginValue)[0];
  const overBudgetProjects = numericRows.filter((row) => row.isOverBudget);
  const negativeProfitProjects = numericRows.filter((row) => row.profitValue < 0);

  const insights = [
    `${highestRevenue.projectName} generated the highest revenue at ${formatCurrency(highestRevenue.revenueValue)}.`,
    `${highestCost.projectName} carried the highest cost at ${formatCurrency(highestCost.costValue)}.`,
    `${lowestMargin.projectName} has the lowest margin at ${formatPercent(lowestMargin.marginValue)}.`,
    `Total profit across ${summary.projectCount} project${summary.projectCount === 1 ? '' : 's'} is ${formatCurrency(summary.totalProfit)}.`,
    `Average profit margin is ${formatPercent(summary.averageMargin)}.`,
  ];

  if (overBudgetProjects.length > 0) {
    insights.push(
      `${overBudgetProjects.length} project${overBudgetProjects.length === 1 ? '' : 's'} ${
        overBudgetProjects.length === 1 ? 'is' : 'are'
      } over budget and should be reviewed.`
    );
  }

  if (summary.averageMargin < 0.15) {
    insights.push('Average margin is below 15%, which is a warning sign for delivery efficiency.');
  }

  if (negativeProfitProjects.length > 0) {
    const sampleProject = negativeProfitProjects[0];
    insights.push(
      `${sampleProject.projectName} has negative profit, meaning costs exceeded revenue.`
    );
  }

  const warningAboutMissingValues = warnings.find((warning) => warning.includes('missing value'));
  if (warningAboutMissingValues) {
    insights.push('Several missing values were fixed automatically during cleaning, so the source file should be reviewed.');
  }

  return insights.slice(0, 8);
};

export const serializeRows = (rows = []) =>
  rows.map((row) => ({
    id: row.id,
    projectName: row.projectName,
    clientName: row.clientName,
    status: row.status,
    date: row.date ? new Date(row.date).toISOString() : null,
    revenue: round(decimalToNumber(row.revenue) || 0),
    cost: round(decimalToNumber(row.cost) || 0),
    budget: row.budget === null ? null : round(decimalToNumber(row.budget) || 0),
    profit: round(decimalToNumber(row.profit) || 0),
    margin: round(decimalToNumber(row.margin) || 0, 4),
    isOverBudget: row.isOverBudget,
    rawJson: row.rawJson,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
  }));
