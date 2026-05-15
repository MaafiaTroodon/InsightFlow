import { isValid, parse } from 'date-fns';
import { toNumber, toSnakeCase } from '../utils/formatters.js';

const COLUMN_ALIASES = {
  projectName: [
    'project', 'project_name', 'name', 'job', 'job_name', 'job_no', 'job_number', 'job_id',
    'job_ref', 'project_id', 'project_no', 'project_title', 'project_code', 'project_ref',
    'site', 'site_name', 'site_id', 'work_order', 'wo', 'wo_number', 'wo_no',
    'contract_no', 'contract_number', 'contract_ref', 'contract_id',
    'order_no', 'order_number', 'po_number', 'po_no', 'purchase_order',
    'task', 'task_name', 'activity',
  ],
  clientName: [
    'client', 'client_name', 'customer', 'customer_name', 'client_company', 'owner',
    'company', 'company_name', 'payee', 'billed_to', 'bill_to', 'bill_to_company',
    'contractor_name', 'vendor', 'vendor_name', 'supplier', 'supplier_name',
    'sub_contractor', 'subcontractor', 'party', 'account_name', 'trading_name',
  ],
  revenue: [
    'revenue', 'sales', 'income', 'receivable',
    'billing_amount', 'billed_amount', 'amount_billed', 'total_billed',
    'claim_amount', 'progress_claim', 'certified_amount', 'approved_claim',
    'draw_amount', 'draw_value', 'milestone_amount', 'billing_total',
    'total_incl_gst', 'total_excl_gst', 'ex_gst', 'inc_gst', 'gst_inclusive',
  ],
  cost: [
    // Generic cost/expense fields
    'cost', 'actual_cost', 'expenses', 'expense', 'labour', 'labor',
    'labour_cost', 'labor_cost', 'materials', 'material', 'material_cost',
    'materials_cost', 'direct_cost', 'indirect_cost', 'cost_to_date',
    'total_cost', 'total_expenses', 'expenditure', 'expenditures',
    'ap_amount', 'payable', 'overhead', 'equipment_cost', 'plant_cost',
    'subcontractor_cost', 'sub_cost', 'purchase_amount', 'disbursement',
    'disbursements', 'job_cost', 'project_cost', 'spend', 'total_spend',
    'debit', 'payment', 'total_payment', 'amount_paid', 'paid_amount',
    'labour_and_materials', 'labor_and_materials', 'labour_materials',
    'direct_labour', 'direct_labor', 'direct_materials', 'site_cost',
    'variation_cost', 'preliminary_cost', 'preliminaries',
    // Invoice / payables fields — Invoice Total IS the cost (money going out)
    'invoice_total', 'invoice_amount', 'invoice_subtotal',
    'total', 'total_amount', 'amount', 'amount_due', 'net_amount',
    'balance_due', 'grand_total', 'subtotal', 'sub_total',
    'payment_amount', 'invoice_value', 'total_value', 'amount_invoiced',
    'net', 'gross', 'charge', 'price', 'total_price', 'value',
    'total_due', 'outstanding', 'balance', 'invoice_balance',
    'fee', 'fees', 'net_total', 'gross_total', 'invoiced_amount', 'total_invoiced',
    'tax_invoice_amount',
  ],
  budget: [
    'budget', 'estimated_budget', 'approved_budget', 'budgeted_amount',
    'original_budget', 'target_cost', 'planned_cost', 'budget_amount',
    'estimate', 'contract_sum', 'contracted_amount', 'contract_amount',
    'contract_value', 'budget_total', 'revised_budget', 'original_contract',
    'contract_price', 'tender_amount', 'awarded_amount', 'approved_amount',
    'quoted_amount', 'quote_amount', 'lump_sum', 'fixed_price',
    'forecast_cost', 'eac', 'estimate_at_completion', 'etc',
  ],
  status: [
    'status', 'state', 'payment_status', 'invoice_status', 'project_status',
    'billing_status', 'approval_status', 'stage', 'phase', 'condition',
    'payment_state', 'current_status', 'invoice_state',
  ],
  date: [
    'date', 'start_date', 'invoice_date', 'issue_date', 'due_date',
    'payment_date', 'transaction_date', 'bill_date', 'order_date',
    'received_date', 'service_date', 'completion_date', 'posting_date',
    'doc_date', 'document_date', 'period', 'invoice_due_date', 'date_issued',
    'date_due', 'date_paid', 'created_date', 'tax_invoice_date',
    'invoice_period', 'billing_date', 'claim_date', 'progress_date',
    'work_date', 'service_period', 'period_end', 'period_start',
    'date_of_invoice', 'date_of_service',
  ],
};

// Keyword-based fuzzy fallback — checked when no exact alias matches.
// Order matters: more specific patterns first to avoid false positives.
const KEYWORD_FALLBACK = [
  { field: 'budget',      keywords: ['budget', 'estimate', 'planned', 'tender', 'awarded', 'contract_sum', 'lump_sum', 'eac', 'etc'] },
  { field: 'status',      keywords: ['status', 'stage', 'phase', 'state', 'condition'] },
  { field: 'date',        keywords: ['date', 'issued', 'due_on', 'paid_on', 'received_on', 'posting'] },
  { field: 'cost',        keywords: ['labour', 'labor', 'material', 'cost', 'expense', 'expenditure', 'overhead', 'disbursement', 'payable', 'plant', 'preliminary'] },
  { field: 'revenue',     keywords: ['revenue', 'income', 'billing', 'charge', 'claim', 'certified', 'draw'] },
  { field: 'projectName', keywords: ['project', 'job', 'site', 'work_order', 'contract', 'order', 'task', 'activity'] },
  { field: 'clientName',  keywords: ['client', 'customer', 'vendor', 'supplier', 'owner', 'company', 'contractor', 'payee'] },
];

export const STANDARD_FIELD_LABELS = {
  projectName: 'Project',
  clientName:  'Client',
  revenue:     'Revenue',
  cost:        'Cost',
  budget:      'Budget',
  status:      'Status',
  date:        'Date',
};

const STATUS_MAP = new Map([
  ['done',        'Completed'],
  ['completed',   'Completed'],
  ['complete',    'Completed'],
  ['active',      'Active'],
  ['in progress', 'Active'],
  ['in-progress', 'Active'],
  ['pending',     'Pending'],
  ['todo',        'Pending'],
  ['paid',        'Paid'],
  ['unpaid',      'Unpaid'],
  ['overdue',     'Overdue'],
  ['approved',    'Approved'],
  ['rejected',    'Rejected'],
  ['submitted',   'Submitted'],
  ['draft',       'Draft'],
  ['invoiced',    'Invoiced'],
  ['partial',     'Partial'],
  ['cancelled',   'Cancelled'],
  ['canceled',    'Cancelled'],
  ['on hold',     'On Hold'],
  ['on_hold',     'On Hold'],
  ['delayed',     'Delayed'],
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
  'dd MMM yyyy',
  'dd-MMM-yyyy',
  'MM/dd/yy',
  'dd/MM/yy',
];

const canonicalFields = new Set(Object.keys(COLUMN_ALIASES));

const pluralize = (count, singular, plural = `${singular}s`) => (count === 1 ? singular : plural);

export const resolveCanonicalField = (key) => {
  const normalized = toSnakeCase(key);

  // 1. Exact alias match
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(normalized)) return canonical;
  }

  // 2. Keyword-based fuzzy match
  for (const { field, keywords } of KEYWORD_FALLBACK) {
    for (const kw of keywords) {
      if (normalized === kw || normalized.includes(kw)) return field;
    }
  }

  return normalized;
};

const buildColumnMapping = (headers = []) => {
  const mapped   = [];
  const ignored  = [];
  const matchedCanonicalFields = new Set();

  headers.forEach((header, index) => {
    const original    = header?.original   ?? `Column ${index + 1}`;
    const normalized  = header?.normalized ?? (toSnakeCase(original) || `column_${index + 1}`);
    const canonicalField = resolveCanonicalField(normalized);

    if (canonicalFields.has(canonicalField)) {
      matchedCanonicalFields.add(canonicalField);
      mapped.push({ original, normalized, mappedTo: STANDARD_FIELD_LABELS[canonicalField], canonicalField });
      return;
    }

    ignored.push({ original, normalized });
  });

  const missing = Object.entries(STANDARD_FIELD_LABELS)
    .filter(([canonicalField]) => !matchedCanonicalFields.has(canonicalField))
    .map(([, label]) => label);

  return { mapped, ignored, missing };
};

const normalizeDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();

  const stringValue = String(value).trim();
  if (!stringValue) return null;

  for (const format of DATE_FORMATS) {
    const parsed = parse(stringValue, format, new Date());
    if (isValid(parsed)) return parsed.toISOString();
  }

  const fallback = new Date(stringValue);
  return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
};

const normalizeStatus = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
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
    row.clientName?.toLowerCase()  || '',
    row.revenue  ?? 0,
    row.cost     ?? 0,
    row.budget   ?? null,
    row.status?.toLowerCase() || '',
    row.date || null,
  ]);

export const cleanRows = (rows = [], headers = []) => {
  const warnings          = [];
  const duplicateTracker  = new Set();
  const cleanedRows       = [];
  let duplicateRowsRemoved = 0;
  let missingValuesFixed   = 0;
  let invalidDates         = 0;

  rows.forEach((rawRow, index) => {
    const rawJson        = buildRawJson(rawRow);
    const normalizedRow  = {};
    Object.entries(rawJson).forEach(([key, value]) => {
      normalizedRow[resolveCanonicalField(key)] = value;
    });

    const projectName = String(
      normalizedRow.projectName ??
      normalizedRow.project_name ??
      normalizedRow.name ??
      `Untitled Project ${index + 1}`
    ).trim();

    if (!normalizedRow.projectName) missingValuesFixed += 1;

    const revenue = toNumber(normalizedRow.revenue);
    const cost    = toNumber(normalizedRow.cost);
    const budget  = toNumber(normalizedRow.budget);
    const date    = normalizeDateValue(normalizedRow.date);

    if (normalizedRow.revenue === undefined || normalizedRow.revenue === null || normalizedRow.revenue === '') {
      missingValuesFixed += 1;
    }
    if (normalizedRow.cost === undefined || normalizedRow.cost === null || normalizedRow.cost === '') {
      missingValuesFixed += 1;
    }
    if (normalizedRow.date && !date) invalidDates += 1;

    const safeRevenue   = revenue ?? 0;
    const safeCost      = cost    ?? 0;
    const profit        = safeRevenue - safeCost;
    const rawMargin     = safeRevenue > 0 ? profit / safeRevenue : 0;
    // Clamp to Decimal(7,4) safe range — avoids DB overflow if revenue is tiny or a mismatched column
    const margin        = Math.max(-999, Math.min(999, rawMargin));
    const isOverBudget  = budget !== null ? safeCost > budget : false;

    const cleanedRow = {
      projectName,
      clientName:  normalizedRow.clientName ? String(normalizedRow.clientName).trim() : null,
      status:      normalizeStatus(normalizedRow.status),
      date,
      revenue:     safeRevenue,
      cost:        safeCost,
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
      `${duplicateRowsRemoved} exact duplicate ${pluralize(duplicateRowsRemoved, 'row')} ${duplicateRowsRemoved === 1 ? 'was' : 'were'} removed.`
    );
  }
  if (invalidDates > 0) {
    warnings.push(
      `${invalidDates} date ${pluralize(invalidDates, 'value')} could not be parsed and ${invalidDates === 1 ? 'was' : 'were'} set to null.`
    );
  }
  if (missingValuesFixed > 0) {
    warnings.push(
      `${missingValuesFixed} missing ${pluralize(missingValuesFixed, 'value')} ${missingValuesFixed === 1 ? 'was' : 'were'} filled with defaults or generated labels.`
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
      columnMapping: buildColumnMapping(headers),
    },
  };
};
