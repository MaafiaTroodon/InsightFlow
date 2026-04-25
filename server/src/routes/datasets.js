import express from 'express';
import { prisma } from '../utils/prisma.js';
import { buildInsights } from '../services/insightService.js';
import { buildChartData, buildSummary, sanitizeRowsForDisplay } from '../services/summaryService.js';

const router = express.Router();

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

    const rows = sanitizeRowsForDisplay(dataset.rows);
    const summary = buildSummary(dataset.rows);

    return res.json({
      dataset: {
        id: dataset.id,
        name: dataset.name,
        originalFileName: dataset.originalFileName,
        rowCount: dataset.rowCount,
        createdAt: dataset.createdAt,
      },
      rows,
      summary,
      chartData: buildChartData(dataset.rows),
      insights: buildInsights({
        rows: dataset.rows,
        summary,
      }),
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
