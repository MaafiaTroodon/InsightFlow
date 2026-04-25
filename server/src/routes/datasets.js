import express from 'express';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { buildInsights } from '../services/insightService.js';
import { buildChartData, buildExecutiveSummary, buildSummary, sanitizeRowsForDisplay } from '../services/summaryService.js';

const router = express.Router();

const getOwnedDataset = async (datasetId, userId) =>
  prisma.dataset.findFirst({
    where: {
      id: datasetId,
      userId,
    },
    include: {
      rows: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

router.get('/datasets', requireAuth, async (req, res, next) => {
  try {
    const datasets = await prisma.dataset.findMany({
      where: {
        userId: req.user.id,
      },
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
        rawRowCount: dataset.rawRowCount,
        fileType: dataset.fileType,
        rowCount: dataset.rowCount,
        duplicateRowsRemoved: dataset.duplicateRowsRemoved,
        missingValuesFixed: dataset.missingValuesFixed,
        createdAt: dataset.createdAt,
        summary,
      };
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/datasets/:id', requireAuth, async (req, res, next) => {
  try {
    const dataset = await getOwnedDataset(req.params.id, req.user.id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found.' });
    }

    const rows = sanitizeRowsForDisplay(dataset.rows);
    const summary = buildSummary(dataset.rows);
    const executiveSummary = buildExecutiveSummary({
      dataset,
      rows: dataset.rows,
      summary,
    });

    return res.json({
      dataset: {
        id: dataset.id,
        name: dataset.name,
        originalFileName: dataset.originalFileName,
        fileType: dataset.fileType,
        rawRowCount: dataset.rawRowCount,
        rowCount: dataset.rowCount,
        duplicateRowsRemoved: dataset.duplicateRowsRemoved,
        missingValuesFixed: dataset.missingValuesFixed,
        columnMapping: dataset.columnMapping ?? null,
        createdAt: dataset.createdAt,
      },
      rows,
      summary,
      executiveSummary,
      chartData: buildChartData(dataset.rows),
      insights: buildInsights({
        rows: dataset.rows,
        summary,
        duplicateRowsRemoved: dataset.duplicateRowsRemoved,
        missingValuesFixed: dataset.missingValuesFixed,
      }),
      rawPreview: dataset.rows.slice(0, 10).map((row) => row.rawJson).filter(Boolean),
      cleanedPreview: rows.slice(0, 10),
      columnMapping: dataset.columnMapping ?? null,
      warnings: Array.isArray(dataset.warnings) ? dataset.warnings : [],
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/datasets/:id', requireAuth, async (req, res, next) => {
  try {
    const existingDataset = await prisma.dataset.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
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
