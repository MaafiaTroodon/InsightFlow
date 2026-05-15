import { decimalToNumber } from '../utils/formatters.js';

const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));
const fmt$ = (v) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Number(v || 0));
const fmtPct = (v) => `${(Number(v || 0) * 100).toFixed(2)}%`;

const toNumericRow = (row) => ({
  projectName:  row.projectName,
  clientName:   row.clientName ?? null,
  status:       row.status ?? null,
  date:         row.date ? new Date(row.date).toISOString() : null,
  revenue:      round(decimalToNumber(row.revenue)  || 0),
  cost:         round(decimalToNumber(row.cost)     || 0),
  budget:       row.budget === null || row.budget === undefined ? null : round(decimalToNumber(row.budget) || 0),
  profit:       round(decimalToNumber(row.profit)   || 0),
  margin:       round(decimalToNumber(row.margin)   || 0, 4),
  marginPercent: round((decimalToNumber(row.margin) || 0) * 100, 2),
  isOverBudget: Boolean(row.isOverBudget),
});

export const sanitizeRowsForDisplay = (rows = []) =>
  rows.map((row) => {
    const raw = (typeof row.rawJson === 'object' && row.rawJson) ? row.rawJson : {};
    return {
      ...toNumericRow(row),
      // Extra fields from the original Excel / CSV for richer display
      vendor:        raw.vendor_name || raw.vendor || raw.supplier_name || raw.supplier || null,
      invoiceNumber: raw.invoice || raw.invoice_number || raw.invoice_ref || raw.invoice_no || null,
      description:   raw.description || null,
      hst:           Number(raw.hst || raw.gst || raw.tax || 0) || 0,
      holdback:      Number(raw.holdback || 0) || 0,
      notes:         raw.notes || null,
      invoiceDate:   raw.invoice_date ? new Date(raw.invoice_date).toISOString() : null,
    };
  });

export const buildSummary = (rows = []) => {
  const totals = sanitizeRowsForDisplay(rows).reduce(
    (acc, row) => {
      acc.totalRevenue += row.revenue;
      acc.totalCost    += row.cost;
      acc.totalProfit  += row.profit;
      acc.totalMargin  += row.margin;
      acc.projectCount += 1;
      acc.overBudgetCount    += row.isOverBudget ? 1 : 0;
      acc.negativeProfitCount += row.profit < 0 ? 1 : 0;
      return acc;
    },
    { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalMargin: 0,
      projectCount: 0, overBudgetCount: 0, negativeProfitCount: 0 }
  );

  return {
    totalRevenue:        round(totals.totalRevenue),
    totalCost:           round(totals.totalCost),
    totalProfit:         round(totals.totalProfit),
    averageMargin:       totals.projectCount ? round(totals.totalMargin / totals.projectCount, 4) : 0,
    projectCount:        totals.projectCount,
    overBudgetCount:     totals.overBudgetCount,
    negativeProfitCount: totals.negativeProfitCount,
  };
};

// ── Category detection from description text ───────────────────────────────────
const CATEGORY_PATTERNS = [
  { cat: 'Equipment Rental',   re: /rent|rental|telehandler|crane|forklift|scaffolding|lift|hoist|excavat|compressor|generator|heater|ducting/i },
  { cat: 'Professional Services', re: /engineer|consult|survey|mep|architect|design|inspection|apprais|legal|accounting|plan|drawing/i },
  { cat: 'Labour',             re: /labour|labor|framing|installation|install|sealing|drilling|coring|painting|clean|service|repair|manpower/i },
  { cat: 'Fuel',               re: /fuel|diesel|gasoline|petrol|4refuel/i },
  { cat: 'Site Services',      re: /toilet|waste|disposal|recycling|garbage|container|roll-off|portable|sanit/i },
  { cat: 'Security',           re: /security|camera|surveillance|monitor/i },
  { cat: 'Appliances',         re: /appliance|fridge|refrigerator|washer|dryer|stove|dishwasher|microwave/i },
  { cat: 'Admin / Office',     re: /microsoft|software|subscription|office|stationery|postage|phone|internet/i },
  { cat: 'Materials',          re: /concrete|drywall|lumber|plywood|steel|rebar|brick|block|pipe|insulation|roofing|siding|flooring|tile|glass|hardware|fastener|screw|nail|tape|sealant|paint|door|window|trim|wood|composite|cement|grout/i },
];

function detectCategory(description = '') {
  for (const { cat, re } of CATEGORY_PATTERNS) {
    if (re.test(description)) return cat;
  }
  return 'Other';
}

// ── Construction-specific analytics from rawJson ──────────────────────────────
function buildConstructionData(rows = []) {
  const vendorTotals         = {};
  const projectTotals        = {};
  const projectCounts        = {};
  const categories           = {};
  const timeline             = {};
  const monthlyCatMap        = {}; // { 'YYYY-MM': { cat: total } }
  const hstIssues            = [];
  const creditMemos          = [];
  const allInvoices          = [];
  let   holdbackTotal        = 0;

  for (const row of rows) {
    const raw    = (typeof row.rawJson === 'object' && row.rawJson) ? row.rawJson : {};
    const cost   = round(decimalToNumber(row.cost) || 0);
    const revenue = round(decimalToNumber(row.revenue) || 0);
    const amount = cost !== 0 ? cost : revenue;
    const vendor = raw.vendor_name || raw.vendor || raw.supplier_name || row.clientName || 'Unknown';
    const proj   = row.projectName || 'Unknown';
    const desc   = String(raw.description || proj);
    const notes  = String(raw.notes || '');
    const holdback = Number(raw.holdback || 0) || 0;
    const cat    = detectCategory(desc);

    // Vendor totals
    if (vendor !== 'Unknown') {
      vendorTotals[vendor] = (vendorTotals[vendor] || 0) + amount;
    }

    // Project totals + invoice counts
    projectTotals[proj] = (projectTotals[proj] || 0) + amount;
    projectCounts[proj] = (projectCounts[proj] || 0) + 1;

    // Category totals
    categories[cat] = (categories[cat] || 0) + Math.abs(amount);

    // Holdback
    holdbackTotal += holdback;

    // Invoice date resolution
    const rawDate = raw.invoice_date || row.date;
    let monthKey = null;
    if (rawDate) {
      const d = typeof rawDate === 'number'
        ? new Date((rawDate - 25569) * 86400000)
        : new Date(rawDate);
      if (!isNaN(d.getTime())) {
        monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        timeline[monthKey] = (timeline[monthKey] || 0) + amount;

        // Monthly by category (stacked bar)
        if (!monthlyCatMap[monthKey]) monthlyCatMap[monthKey] = {};
        monthlyCatMap[monthKey][cat] = (monthlyCatMap[monthKey][cat] || 0) + Math.abs(amount);
      }
    }

    // All invoices for top-N table
    allInvoices.push({
      vendor,
      project: proj,
      amount,
      description: desc.slice(0, 70),
      invoiceNumber: raw.invoice || raw.invoice_number || raw.invoice_no || null,
      month: monthKey,
      hst: Number(raw.hst || raw.gst || raw.tax || 0) || 0,
    });

    // HST issues
    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('verify') || lowerNotes.includes('hst') || lowerNotes.includes('tax shown as')) {
      hstIssues.push({
        vendor,
        project: proj,
        amount,
        notes: notes.slice(0, 120),
        invoiceNumber: raw.invoice || raw.invoice_number || null,
      });
    }

    // Credit memos
    if (amount < 0) {
      creditMemos.push({
        vendor,
        project: proj,
        amount,
        description: desc.slice(0, 80),
        invoiceNumber: raw.invoice || raw.invoice_number || null,
      });
    }
  }

  // Sorted timeline + cumulative running total
  const sortedTimeline = Object.entries(timeline).sort();
  let running = 0;
  const cumulativeTimeline = sortedTimeline.map(([month, total]) => {
    running += total;
    return { month, total: round(total), cumulative: round(running) };
  });

  // Monthly stacked-by-category data
  const allCats = [...new Set(Object.values(monthlyCatMap).flatMap(Object.keys))];
  const monthlyByCategory = Object.entries(monthlyCatMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cats]) => {
      const entry = { month };
      allCats.forEach(c => { entry[c] = round(cats[c] || 0); });
      return entry;
    });

  // Project with count + total
  const projectBreakdown = Object.entries(projectTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([project, total]) => ({
      project,
      total: round(total),
      count: projectCounts[project] || 0,
    }));

  return {
    vendorBreakdown: Object.entries(vendorTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([vendor, total]) => ({ vendor, total: round(total) })),

    projectBreakdown,

    categoryBreakdown: Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => ({ category, total: round(total) })),

    invoiceTimeline: cumulativeTimeline,

    monthlyByCategory,
    allCats,

    topInvoices: [...allInvoices]
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 15),

    invoiceCount: allInvoices.length,
    avgInvoiceSize: allInvoices.length
      ? round(allInvoices.reduce((s, i) => s + Math.abs(i.amount), 0) / allInvoices.length)
      : 0,
    largestInvoice: allInvoices.length
      ? round(Math.max(...allInvoices.map(i => Math.abs(i.amount))))
      : 0,

    hstIssues,
    creditMemos,
    holdbackTotal: round(holdbackTotal),
  };
}

export const buildChartData = (rows = []) => {
  const normalizedRows = sanitizeRowsForDisplay(rows);
  const construction   = buildConstructionData(rows);

  const statusCounts = normalizedRows.reduce((acc, row) => {
    if (!row.status) return acc;
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  return {
    // Legacy fields kept for compatibility
    projectFinancials: normalizedRows.map((row) => ({
      projectName: row.projectName,
      revenue: row.revenue,
      cost: row.cost,
      profit: row.profit,
      budget: row.budget,
    })),
    statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    marginByProject: normalizedRows.map((row) => ({
      projectName: row.projectName,
      marginPercent: row.marginPercent,
    })),
    // New construction-specific analytics
    ...construction,
  };
};

export const buildExecutiveSummary = ({ dataset, rows = [], summary }) => {
  const normalizedRows  = sanitizeRowsForDisplay(rows);
  const isPayables = summary.totalCost > 0 && summary.totalRevenue === 0;
  const mainAmount = isPayables ? summary.totalCost : summary.totalRevenue;

  const topByMain = normalizedRows.reduce(
    (best, row) => {
      const v = isPayables ? row.cost : row.revenue;
      return best === null || v > (isPayables ? best.cost : best.revenue) ? row : best;
    }, null);

  const construction = buildConstructionData(rows);
  const uniqueProjects = new Set(rows.map(r => r.projectName)).size;

  if (isPayables) {
    return [
      `This payables register contains ${dataset.rowCount} invoices from ${dataset.originalFileName}.`,
      `Total payables: ${fmt$(mainAmount)} across ${uniqueProjects} project${uniqueProjects !== 1 ? 's' : ''}.`,
      construction.hstIssues.length > 0
        ? `${construction.hstIssues.length} invoice${construction.hstIssues.length > 1 ? 's' : ''} flagged for HST rate verification — review the HST Issues section.`
        : 'All invoices passed HST review with no discrepancies flagged.',
      construction.holdbackTotal > 0
        ? `${fmt$(construction.holdbackTotal)} in holdback is outstanding.`
        : topByMain
          ? `${topByMain.projectName} is the highest-spend project at ${fmt$(isPayables ? topByMain.cost : topByMain.revenue)}.`
          : 'Review the project and vendor breakdowns below for detailed analysis.',
    ];
  }

  const highestRevProject = normalizedRows.reduce(
    (best, row) => best === null || row.revenue > best.revenue ? row : best, null);
  const lowestMarginProject = normalizedRows.reduce(
    (best, row) => best === null || row.margin < best.margin ? row : best, null);

  return [
    `This dataset contains ${dataset.rowCount} cleaned business records from ${dataset.originalFileName}.`,
    `Total revenue is ${fmt$(summary.totalRevenue)} with ${fmt$(summary.totalProfit)} in profit, giving an average margin of ${fmtPct(summary.averageMargin)}.`,
    `${summary.overBudgetCount} projects are over budget and ${summary.negativeProfitCount} projects have negative profit.`,
    highestRevProject && lowestMarginProject
      ? `${highestRevProject.projectName} generated the highest revenue, while ${lowestMarginProject.projectName} has the lowest margin.`
      : 'Review the charts below for revenue, cost, and margin by project.',
  ];
};
