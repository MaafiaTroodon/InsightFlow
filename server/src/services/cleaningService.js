import { isValid, parse } from 'date-fns';
import { toNumber, toSnakeCase } from '../utils/formatters.js';

const COLUMN_ALIASES = {
  projectName: ['project', 'project_name', 'name'],
  clientName: ['client', 'client_name', 'customer'],
  revenue: ['revenue', 'invoice_amount', 'amount', 'sales'],
  cost: ['cost', 'actual_cost', 'expenses'],
  budget: ['budget', 'estimated_budget'],
  status: ['status', 'state'],
  date: ['date', 'start_date', 'invoice_date'],
};

const STATUS_MAP = new Map([
  ['done', 'Completed'],
  ['completed', 'Completed'],
  ['complete', 'Completed'],
  ['active', 'Active'],
  ['in progress', 'Active'],
  ['in-progress', 'Active'],
  ['pending', 'Pending'],
  ['todo', 'Pending'],
]);

const DATE_FORMATS = [
  'yyyy-MM-dd',
  'MM/dd/yyyy',
  'dd/MM/yyyy',
  'M/d/yyyy',
  'd/M/yyyy',
  'MM-dd-yyyy',
  'dd-MM-yyyy',
  'MMM d, yyyy',
  'MMMM d, yyyy',
];

const canonicalFields = new Set(Object.keys(COLUMN_ALIASES));

const pluralize = (count, singular, plural = `${singular}s`) => (count === 1 ? singular : plural);

const resolveCanonicalField = (key) => {
  const normalized = toSnakeCase(key);

  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
};

const normalizeDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return null;
  }

  for (const format of DATE_FORMATS) {
    const parsed = parse(stringValue, format, new Date());
    if (isValid(parsed)) {
      return parsed.toISOString();
    }
  }

  const fallback = new Date(stringValue);
  return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
};

const normalizeStatus = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  return STATUS_MAP.get(normalized) || String(value).trim();
};

const buildRawJson = (rawRow) => {
  const normalized = {};

  Object.entries(rawRow).forEach(([key, value]) => {
    normalized[toSnakeCase(key)] = value;
  });

  return normalized;
};

const buildDuplicateKey = (row) =>
  JSON.stringify([
    row.projectName?.toLowerCase() || '',
    row.clientName?.toLowerCase() || '',
    row.revenue ?? 0,
    row.cost ?? 0,
    row.budget ?? null,
    row.status?.toLowerCase() || '',
    row.date || null,
  ]);

export const cleanRows = (rows = []) => {
  const warnings = [];
  const duplicateTracker = new Set();
  const cleanedRows = [];
  let duplicateRowsRemoved = 0;
  let missingValuesFixed = 0;
  let invalidDates = 0;

  rows.forEach((rawRow, index) => {
    const rawJson = buildRawJson(rawRow);
    const normalizedRow = {};
    Object.entries(rawJson).forEach(([key, value]) => {
      normalizedRow[resolveCanonicalField(key)] = value;
    });

    const projectName = String(
      normalizedRow.projectName ||
        normalizedRow.project_name ||
        normalizedRow.name ||
        `Untitled Project ${index + 1}`
    ).trim();

    if (!normalizedRow.projectName) {
      missingValuesFixed += 1;
    }

    const revenue = toNumber(normalizedRow.revenue);
    const cost = toNumber(normalizedRow.cost);
    const budget = toNumber(normalizedRow.budget);
    const date = normalizeDateValue(normalizedRow.date);

    if (normalizedRow.revenue === undefined || normalizedRow.revenue === null || normalizedRow.revenue === '') {
      missingValuesFixed += 1;
    }

    if (normalizedRow.cost === undefined || normalizedRow.cost === null || normalizedRow.cost === '') {
      missingValuesFixed += 1;
    }

    if (normalizedRow.date && !date) {
      invalidDates += 1;
    }

    const safeRevenue = revenue ?? 0;
    const safeCost = cost ?? 0;
    const profit = safeRevenue - safeCost;
    const margin = safeRevenue > 0 ? profit / safeRevenue : 0;
    const isOverBudget = budget !== null ? safeCost > budget : false;

    const cleanedRow = {
      projectName,
      clientName: normalizedRow.clientName ? String(normalizedRow.clientName).trim() : null,
      status: normalizeStatus(normalizedRow.status),
      date,
      revenue: safeRevenue,
      cost: safeCost,
      budget,
      profit,
      margin,
      isOverBudget,
      rawJson,
    };

    const duplicateKey = buildDuplicateKey(cleanedRow);
    if (duplicateTracker.has(duplicateKey)) {
      duplicateRowsRemoved += 1;
      return;
    }

    duplicateTracker.add(duplicateKey);

    cleanedRows.push(cleanedRow);
  });

  if (duplicateRowsRemoved > 0) {
    warnings.push(
      `${duplicateRowsRemoved} exact duplicate ${pluralize(duplicateRowsRemoved, 'row')} ${
        duplicateRowsRemoved === 1 ? 'was' : 'were'
      } removed.`
    );
  }

  if (invalidDates > 0) {
    warnings.push(
      `${invalidDates} date ${pluralize(invalidDates, 'value')} could not be parsed and ${
        invalidDates === 1 ? 'was' : 'were'
      } set to null.`
    );
  }

  if (missingValuesFixed > 0) {
    warnings.push(
      `${missingValuesFixed} missing ${pluralize(missingValuesFixed, 'value')} ${
        missingValuesFixed === 1 ? 'was' : 'were'
      } filled with defaults or generated labels.`
    );
  }

  const discoveredCanonicalFields = Array.from(
    new Set(
      cleanedRows.flatMap((row) =>
        Object.keys(row).filter((key) => canonicalFields.has(key) && row[key] !== null && row[key] !== undefined)
      )
    )
  );

  return {
    cleanedRows,
    warnings,
    stats: {
      duplicateRowsRemoved,
      missingValuesFixed,
      invalidDates,
      discoveredCanonicalFields,
    },
  };
};
