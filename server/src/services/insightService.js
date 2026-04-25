import { formatCurrency, formatPercent } from '../utils/formatters.js';
import { sanitizeRowsForDisplay } from './summaryService.js';

export const buildInsights = ({
  rows = [],
  summary,
  duplicateRowsRemoved = 0,
  missingValuesFixed = 0,
}) => {
  const normalizedRows = sanitizeRowsForDisplay(rows);

  if (!normalizedRows.length) {
    return [
      {
        type: 'neutral',
        label: 'No data',
        message: 'No cleaned rows were available for business analysis.',
      },
    ];
  }

  const highestRevenue = [...normalizedRows].sort((a, b) => b.revenue - a.revenue)[0];
  const highestCost = [...normalizedRows].sort((a, b) => b.cost - a.cost)[0];
  const lowestMargin = [...normalizedRows].sort((a, b) => a.margin - b.margin)[0];
  const negativeProfitProject = normalizedRows.find((row) => row.profit < 0);

  const insights = [
    {
      type: 'positive',
      label: 'Top revenue project',
      message: `${highestRevenue.projectName} generated the highest revenue at ${formatCurrency(highestRevenue.revenue)}.`,
    },
    {
      type: 'warning',
      label: 'Highest cost project',
      message: `${highestCost.projectName} carried the highest cost at ${formatCurrency(highestCost.cost)}.`,
    },
    {
      type: lowestMargin.marginPercent < 15 ? 'danger' : 'neutral',
      label: 'Lowest margin project',
      message: `${lowestMargin.projectName} has the lowest margin at ${formatPercent(lowestMargin.margin)}.`,
    },
    {
      type: summary.totalProfit >= 0 ? 'positive' : 'danger',
      label: 'Total profit',
      message: `The dataset produced ${formatCurrency(summary.totalProfit)} total profit across ${summary.projectCount} projects.`,
    },
    {
      type: summary.overBudgetCount > 0 ? 'warning' : 'positive',
      label: 'Over-budget projects',
      message:
        summary.overBudgetCount > 0
          ? `${summary.overBudgetCount} project${summary.overBudgetCount === 1 ? '' : 's'} are over budget and should be reviewed.`
          : 'No projects are currently flagged as over budget.',
    },
    {
      type: summary.negativeProfitCount > 0 ? 'danger' : 'positive',
      label: 'Negative-profit projects',
      message:
        summary.negativeProfitCount > 0
          ? `${summary.negativeProfitCount} project${summary.negativeProfitCount === 1 ? '' : 's'} have negative profit.`
          : 'Every project in this dataset remains above break-even.',
    },
  ];

  if (negativeProfitProject) {
    insights.push({
      type: 'danger',
      label: 'Cost exceeded revenue',
      message: `${negativeProfitProject.projectName} has negative profit. Costs exceeded revenue by ${formatCurrency(
        Math.abs(negativeProfitProject.profit)
      )}.`,
    });
  }

  if (missingValuesFixed > 0) {
    insights.push({
      type: 'warning',
      label: 'Missing values repaired',
      message: `${missingValuesFixed} missing value${missingValuesFixed === 1 ? '' : 's'} were repaired during cleaning.`,
    });
  }

  if (duplicateRowsRemoved > 0) {
    insights.push({
      type: 'neutral',
      label: 'Duplicate rows removed',
      message: `${duplicateRowsRemoved} duplicate row${duplicateRowsRemoved === 1 ? '' : 's'} were removed before storage.`,
    });
  }

  return insights.slice(0, 8);
};
