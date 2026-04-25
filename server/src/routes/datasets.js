import express from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../utils/prisma.js';
import { parseUploadedFile } from '../services/fileService.js';
import { cleanRows } from '../services/cleaningService.js';
import {
  buildChartData,
  buildInsights,
  buildSummary,
  serializeRows,
} from '../services/analyticsService.js';

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
    if (!req.file) {
      return res.status(400).json({ message: 'A CSV, XLSX, or XLS file is required.' });
    }

    const parsed = parseUploadedFile(req.file);
    const cleaned = cleanRows(parsed.rows);
    const combinedWarnings = [...parsed.warnings, ...cleaned.warnings];

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

    const serializedRows = serializeRows(dataset.rows);
    const summary = buildSummary(dataset.rows);

    return res.status(201).json({
      datasetId: dataset.id,
      datasetName: dataset.name,
      fileType: parsed.fileType,
      warnings: combinedWarnings,
      rawPreview: parsed.rows.slice(0, 5),
      cleanedPreview: serializedRows.slice(0, 5),
      summary,
      charts: buildChartData(serializedRows),
      insights: buildInsights(serializedRows, summary, combinedWarnings),
      stats: cleaned.stats,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/datasets', async (_req, res, next) => {
  try {
    const datasets = await prisma.dataset.findMany({
      include: {
        rows: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const payload = datasets.map((dataset) => {
      const summary = buildSummary(dataset.rows);

      return {
        id: dataset.id,
        name: dataset.name,
        originalFileName: dataset.originalFileName,
        rowCount: dataset.rowCount,
        createdAt: dataset.createdAt,
        summary,
      };
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/datasets/:id', async (req, res, next) => {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        rows: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found.' });
    }

    const serializedRows = serializeRows(dataset.rows);
    const summary = buildSummary(dataset.rows);

    return res.json({
      dataset: {
        id: dataset.id,
        name: dataset.name,
        originalFileName: dataset.originalFileName,
        rowCount: dataset.rowCount,
        createdAt: dataset.createdAt,
      },
      rows: serializedRows,
      summary,
      charts: buildChartData(serializedRows),
      insights: buildInsights(serializedRows, summary),
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/datasets/:id', async (req, res, next) => {
  try {
    const existingDataset = await prisma.dataset.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingDataset) {
      return res.status(404).json({ message: 'Dataset not found.' });
    }

    await prisma.dataset.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
