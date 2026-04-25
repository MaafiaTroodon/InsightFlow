import express from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../utils/prisma.js';
import { parseUploadedFile } from '../services/parserService.js';
import { cleanRows } from '../services/cleaningService.js';
import { buildInsights } from '../services/insightService.js';
import { buildSummary, sanitizeRowsForDisplay } from '../services/summaryService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const createDatasetName = (filename) => {
  const extension = path.extname(filename);
  return path.basename(filename, extension).replace(/[-_]+/g, ' ').trim() || 'Uploaded Dataset';
};

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const parsed = parseUploadedFile(req.file);
    const cleaned = cleanRows(parsed.rows);
    const warnings = [...parsed.warnings, ...cleaned.warnings];

    const dataset = await prisma.dataset.create({
      data: {
        name: createDatasetName(req.file.originalname),
        originalFileName: req.file.originalname,
        rowCount: cleaned.cleanedRows.length,
        rows: {
          create: cleaned.cleanedRows.map((row) => ({
            projectName: row.projectName,
            clientName: row.clientName,
            status: row.status,
            date: row.date ? new Date(row.date) : null,
            revenue: row.revenue,
            cost: row.cost,
            budget: row.budget,
            profit: row.profit,
            margin: row.margin,
            isOverBudget: row.isOverBudget,
            rawJson: row.rawJson,
          })),
        },
      },
      include: {
        rows: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const displayRows = sanitizeRowsForDisplay(dataset.rows);
    const summary = buildSummary(dataset.rows);
    const insights = buildInsights({
      rows: dataset.rows,
      summary,
      duplicateRowsRemoved: cleaned.stats.duplicateRowsRemoved,
      missingValuesFixed: cleaned.stats.missingValuesFixed,
    });

    res.status(201).json({
      datasetId: dataset.id,
      datasetName: dataset.name,
      fileType: parsed.fileType,
      rowCount: dataset.rowCount,
      duplicateRowsRemoved: cleaned.stats.duplicateRowsRemoved,
      missingValuesFixed: cleaned.stats.missingValuesFixed,
      rawPreview: parsed.rows.slice(0, 5),
      cleanedPreview: displayRows.slice(0, 5),
      warnings,
      summary,
      insights,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
