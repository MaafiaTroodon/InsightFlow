import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// ── Regex patterns for field extraction ──────────────────────────────────────

const PATTERNS = {
  invoiceNumber: [
    /invoice\s*(?:no|number|#|num)[:\s#]+([A-Z0-9\-\/]+)/i,
    /inv[:\s#]+([A-Z0-9\-\/]+)/i,
    /(?:^|\s)#\s*([A-Z0-9\-\/]+)/im,
  ],
  vendorName: [
    /(?:from|vendor|supplier|company|billed?\s*by)[:\s]+([^\n]{3,60})/i,
    /^([A-Z][A-Z\s&.,'-]{5,50}(?:PTY|LTD|INC|LLC|CORP|CO|GROUP|SERVICES|CONSTRUCTION|BUILDERS?)?\.?)\s*(?:ABN|ACN|GST|TAX)?/im,
  ],
  clientName: [
    /(?:to|bill\s*to|client|customer|attention)[:\s]+([^\n]{3,60})/i,
    /(?:invoice\s+to|billed?\s+to)[:\s]+([^\n]{3,60})/i,
  ],
  projectName: [
    /project[:\s]+([^\n]{3,80})/i,
    /job\s*(?:name|no|number|ref)?[:\s]+([^\n]{3,80})/i,
    /site[:\s]+([^\n]{3,80})/i,
    /work\s*order[:\s]+([^\n]{3,80})/i,
    /re[:\s]+([^\n]{3,80})/i,
  ],
  invoiceDate: [
    /(?:invoice\s+)?date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(?:invoice\s+)?date[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /dated?[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /issued?[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
  ],
  dueDate: [
    /due\s*(?:date|by|on)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /payment\s*due[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /payable\s*by[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  ],
  totalAmount: [
    /(?:grand\s+total|total\s+(?:amount\s+)?due|amount\s+due|total\s+payable|total\s+invoiced?)[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:invoice\s+total|total\s+amount|net\s+total|total\s+incl)[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /total[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)\s*$/im,
  ],
  subtotal: [
    /sub(?:\s*-?\s*)total[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /net\s*amount[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  ],
  tax: [
    /(?:gst|vat|tax|hst|pst)[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  ],
  abn: [
    /ABN[:\s]+(\d[\d\s]{9,12})/i,
  ],
  poNumber: [
    /(?:purchase\s+order|po\s*(?:no|number|#)?)[:\s#]+([A-Z0-9\-\/]+)/i,
  ],
  lineItems: null, // extracted separately
};

const parseAmount = (str) => {
  if (!str) return null;
  const cleaned = String(str).replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
};

const firstMatch = (text, patternList) => {
  for (const re of patternList) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
};

// Extract line items: look for patterns like "Description ... $amount"
const extractLineItems = (text) => {
  const items = [];
  // Match lines that end with a dollar amount
  const linePattern = /^(.{5,60}?)\s+\$?\s*([\d,]+\.\d{2})\s*$/gim;
  let match;
  while ((match = linePattern.exec(text)) !== null) {
    const description = match[1].replace(/\s+/g, ' ').trim();
    const amount = parseAmount(match[2]);
    // Skip lines that look like headers or totals
    if (amount && !/(total|subtotal|gst|vat|tax|amount|due|balance)/i.test(description)) {
      items.push({ description, amount });
    }
  }
  return items.slice(0, 20);
};

// Calculate confidence score for a field based on whether it was found + quality
const confidence = (value, high = 0.9, low = 0.5) => (value ? high : low);

export const extractPdfData = async (buffer) => {
  let text = '';

  try {
    const data = await pdfParse(buffer);
    text = data.text || '';
  } catch (err) {
    throw Object.assign(new Error('Failed to parse PDF: ' + err.message), { status: 400 });
  }

  if (!text.trim()) {
    throw Object.assign(new Error('PDF appears to be a scanned image with no extractable text. Use an OCR tool first.'), { status: 422 });
  }

  const invoiceNumber = firstMatch(text, PATTERNS.invoiceNumber);
  const vendorName    = firstMatch(text, PATTERNS.vendorName);
  const clientName    = firstMatch(text, PATTERNS.clientName);
  const projectName   = firstMatch(text, PATTERNS.projectName);
  const invoiceDate   = firstMatch(text, PATTERNS.invoiceDate);
  const dueDate       = firstMatch(text, PATTERNS.dueDate);
  const totalRaw      = firstMatch(text, PATTERNS.totalAmount);
  const subtotalRaw   = firstMatch(text, PATTERNS.subtotal);
  const taxRaw        = firstMatch(text, PATTERNS.tax);
  const abn           = firstMatch(text, PATTERNS.abn);
  const poNumber      = firstMatch(text, PATTERNS.poNumber);
  const lineItems     = extractLineItems(text);

  const totalAmount   = parseAmount(totalRaw);
  const subtotal      = parseAmount(subtotalRaw);
  const taxAmount     = parseAmount(taxRaw);

  // Build confidence scores
  const scores = {
    invoiceNumber: confidence(invoiceNumber, 0.95, 0.3),
    vendorName:    confidence(vendorName,    0.85, 0.3),
    clientName:    confidence(clientName,    0.80, 0.3),
    projectName:   confidence(projectName,   0.75, 0.2),
    invoiceDate:   confidence(invoiceDate,   0.90, 0.3),
    totalAmount:   confidence(totalAmount,   0.95, 0.2),
    lineItems:     lineItems.length > 0 ? 0.8 : 0.2,
  };

  const overallConfidence = Math.round(
    (Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length) * 100
  );

  // Classify document type
  const lowerText = text.toLowerCase();
  let docType = 'Invoice';
  if (/progress\s+claim/i.test(text))           docType = 'Progress Claim';
  else if (/purchase\s+order/i.test(text))       docType = 'Purchase Order';
  else if (/receipt/i.test(text))                docType = 'Receipt';
  else if (/tax\s+invoice/i.test(text))          docType = 'Tax Invoice';
  else if (/statement/i.test(text))              docType = 'Statement';
  else if (/job\s+log|site\s+diary|daily\s+log/i.test(text)) docType = 'Job Log';

  // Generate AI summary
  const summaryParts = [];
  if (docType !== 'Invoice') summaryParts.push(docType);
  if (invoiceNumber)  summaryParts.push(`#${invoiceNumber}`);
  if (vendorName)     summaryParts.push(`from ${vendorName}`);
  if (clientName)     summaryParts.push(`to ${clientName}`);
  if (totalAmount)    summaryParts.push(`for $${totalAmount.toLocaleString()}`);
  if (invoiceDate)    summaryParts.push(`dated ${invoiceDate}`);
  if (dueDate)        summaryParts.push(`(due ${dueDate})`);
  if (projectName)    summaryParts.push(`— Project: ${projectName}`);

  const summary = summaryParts.length
    ? summaryParts.join(' ')
    : `${docType} document extracted — ${Object.values(scores).filter(v => v >= 0.7).length}/${Object.values(scores).length} fields detected`;

  // Extract potential risks/flags
  const flags = [];
  if (!totalAmount)   flags.push({ type: 'warning', message: 'Total amount could not be detected — review manually' });
  if (!invoiceDate)   flags.push({ type: 'warning', message: 'Invoice date not found' });
  if (!vendorName)    flags.push({ type: 'info',    message: 'Vendor/supplier name unclear' });
  if (overallConfidence < 50) flags.push({ type: 'danger', message: 'Low confidence extraction — verify all fields' });

  return {
    docType,
    summary,
    overallConfidence,
    fields: {
      invoiceNumber,
      vendorName,
      clientName,
      projectName,
      invoiceDate,
      dueDate,
      totalAmount,
      subtotal,
      taxAmount,
      abn,
      poNumber,
    },
    lineItems,
    confidenceScores: scores,
    flags,
    rawTextLength: text.length,
    rawTextPreview: text.slice(0, 500).replace(/\s+/g, ' ').trim(),
  };
};
