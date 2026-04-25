import path from 'path';
import XLSX from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import { toSnakeCase } from '../utils/formatters.js';

const CSV_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain'];
const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/vnd.ms-excel',
];

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const sanitizeHeader = (header, index) => {
  const normalized = toSnakeCase(header);
  return normalized || `column_${index + 1}`;
};

const looksLikeHeaderRow = (row = []) => {
  if (!row.length) {
    return false;
  }

  const nonEmptyCells = row.filter((value) => value !== null && value !== undefined && String(value).trim() !== '');
  if (!nonEmptyCells.length) {
    return false;
  }

  const stringLikeCount = nonEmptyCells.filter((value) => typeof value === 'string').length;
  const hasMostlyStrings = stringLikeCount >= Math.ceil(nonEmptyCells.length / 2);
  const hasPureNumbers = nonEmptyCells.some((value) => /^-?\d+([.,]\d+)?$/.test(String(value).trim()));

  return hasMostlyStrings && !hasPureNumbers;
};

const matrixToObjects = (matrix) => {
  const rows = Array.isArray(matrix) ? matrix.filter((row) => Array.isArray(row)) : [];

  if (!rows.length) {
    throw createError('The uploaded file is empty.');
  }

  const firstRow = rows[0];
  const hasHeaders = looksLikeHeaderRow(firstRow);
  const headers = (hasHeaders ? firstRow : firstRow.map((_, index) => `column_${index + 1}`)).map(sanitizeHeader);
  const dataRows = hasHeaders ? rows.slice(1) : rows;

  const warnings = [];
  if (!hasHeaders) {
    warnings.push('Column headers were missing or invalid, so generic column names were generated.');
  }

  const objects = dataRows
    .filter((row) => row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''))
    .map((row) => {
      const output = {};
      headers.forEach((header, index) => {
        output[header] = row[index] ?? null;
      });
      return output;
    });

  if (!objects.length) {
    throw createError('The uploaded file only contains headers or empty rows.');
  }

  return { rows: objects, warnings };
};

export const detectFileType = (file) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const mimeType = file.mimetype || '';

  if (extension === '.csv' || CSV_MIME_TYPES.includes(mimeType)) {
    return 'csv';
  }

  if (['.xlsx', '.xls'].includes(extension) || EXCEL_MIME_TYPES.includes(mimeType)) {
    return 'excel';
  }

  throw createError('Unsupported file format. Please upload a CSV, XLSX, or XLS file.');
};

export const parseUploadedFile = (file) => {
  if (!file) {
    throw createError('A CSV, XLSX, or XLS file is required.');
  }

  if (!file.buffer || !file.buffer.length) {
    throw createError('The uploaded file is empty.');
  }

  const fileType = detectFileType(file);

  if (fileType === 'csv') {
    const matrix = parseCsv(file.buffer, {
      relax_column_count: true,
      skip_empty_lines: false,
      bom: true,
    });

    return {
      fileType: 'CSV',
      ...matrixToObjects(matrix),
    };
  }

  const workbook = XLSX.read(file.buffer, {
    type: 'buffer',
    cellDates: true,
  });

  const [firstSheetName] = workbook.SheetNames;
  if (!firstSheetName) {
    throw createError('The Excel workbook did not contain any sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
    raw: false,
  });

  return {
    fileType: 'Excel',
    ...matrixToObjects(matrix),
  };
};
