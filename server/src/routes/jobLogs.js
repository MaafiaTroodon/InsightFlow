import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { analyzeJobLog } from '../services/jobLogService.js';
import { isCloudConfigured, uploadBuffer, deleteAsset } from '../services/cloudStorage.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../../uploads/joblogs');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Always use memory storage so we can either stream to Cloudinary or write to disk
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(Object.assign(new Error('Only image files are accepted.'), { status: 400 }));
  },
});

/**
 * Save a file either to Cloudinary or local disk.
 * Returns an attachment object { name, size, url, type, publicId? }.
 */
async function storeFile(file) {
  if (isCloudConfigured()) {
    const result = await uploadBuffer(file.buffer, {
      public_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
    return {
      name:      file.originalname,
      size:      file.size,
      url:       result.url,
      publicId:  result.publicId,
      type:      file.mimetype,
      storage:   'cloudinary',
    };
  }

  // Fallback: write to local disk
  const ext      = path.extname(file.originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.promises.writeFile(filepath, file.buffer);
  return {
    name:    file.originalname,
    size:    file.size,
    url:     `/uploads/joblogs/${filename}`,
    type:    file.mimetype,
    storage: 'local',
  };
}

// GET /api/job-logs
router.get('/job-logs', requireAuth, async (req, res, next) => {
  try {
    const { project, riskLevel, from, to, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.user.id };
    if (project)    where.projectName = { contains: project, mode: 'insensitive' };
    if (riskLevel)  where.riskLevel   = riskLevel;
    if (from || to) {
      where.logDate = {};
      if (from) where.logDate.gte = new Date(from);
      if (to)   where.logDate.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.jobLog.findMany({
        where,
        orderBy: { logDate: 'desc' },
        take:    Number(limit),
        skip:    Number(offset),
        select: {
          id: true, projectName: true, siteLocation: true, logDate: true,
          author: true, weather: true, summary: true, riskLevel: true,
          delays: true, risks: true, actionItems: true, contractors: true, attachments: true, createdAt: true,
        },
      }),
      prisma.jobLog.count({ where }),
    ]);

    res.json({ logs, total, limit: Number(limit), offset: Number(offset) });
  } catch (error) {
    next(error);
  }
});

// GET /api/job-logs/:id
router.get('/job-logs/:id', requireAuth, async (req, res, next) => {
  try {
    const log = await prisma.jobLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!log) return res.status(404).json({ message: 'Job log not found.' });
    res.json(log);
  } catch (error) {
    next(error);
  }
});

// POST /api/job-logs
router.post('/job-logs', requireAuth, photoUpload.array('photos', 10), async (req, res, next) => {
  try {
    const { projectName, siteLocation, logDate, author, weather, rawText } = req.body;

    if (!projectName?.trim()) return res.status(400).json({ message: 'projectName is required.' });
    if (!rawText?.trim())     return res.status(400).json({ message: 'rawText (log content) is required.' });

    const analysis = analyzeJobLog(rawText);

    const attachments = await Promise.all((req.files || []).map(storeFile));

    const log = await prisma.jobLog.create({
      data: {
        userId:       req.user.id,
        projectName:  projectName.trim(),
        siteLocation: siteLocation?.trim() || null,
        logDate:      logDate ? new Date(logDate) : new Date(),
        author:       author?.trim()  || null,
        weather:      weather?.trim() || null,
        rawText:      rawText.trim(),
        summary:      analysis.summary,
        delays:       analysis.delays,
        contractors:  analysis.contractors,
        risks:        analysis.risks,
        actionItems:  analysis.actionItems,
        riskLevel:    analysis.riskLevel,
        attachments:  attachments.length ? attachments : null,
      },
    });

    res.status(201).json({ ...log, analysis });
  } catch (error) {
    next(error);
  }
});

// POST /api/job-logs/:id/reanalyze
router.post('/job-logs/:id/reanalyze', requireAuth, async (req, res, next) => {
  try {
    const log = await prisma.jobLog.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ message: 'Job log not found.' });

    const analysis = analyzeJobLog(log.rawText);

    const updated = await prisma.jobLog.update({
      where: { id: log.id },
      data: {
        summary:     analysis.summary,
        delays:      analysis.delays,
        contractors: analysis.contractors,
        risks:       analysis.risks,
        actionItems: analysis.actionItems,
        riskLevel:   analysis.riskLevel,
      },
    });

    res.json({ ...updated, analysis });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/job-logs/:id
router.delete('/job-logs/:id', requireAuth, async (req, res, next) => {
  try {
    const log = await prisma.jobLog.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ message: 'Job log not found.' });

    // Delete Cloudinary assets if any
    const attachments = Array.isArray(log.attachments) ? log.attachments : [];
    await Promise.allSettled(
      attachments.filter(a => a.publicId).map(a => deleteAsset(a.publicId))
    );

    await prisma.jobLog.delete({ where: { id: log.id } });
    res.json({ message: 'Job log deleted.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/job-logs/:id/photos — add photos to an existing log
router.post('/job-logs/:id/photos', requireAuth, photoUpload.array('photos', 10), async (req, res, next) => {
  try {
    const log = await prisma.jobLog.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ message: 'Job log not found.' });

    const newAttachments = await Promise.all((req.files || []).map(storeFile));

    const existing    = Array.isArray(log.attachments) ? log.attachments : [];
    const attachments = [...existing, ...newAttachments];

    const updated = await prisma.jobLog.update({
      where: { id: log.id },
      data:  { attachments },
    });
    res.json({ attachments: updated.attachments });
  } catch (error) {
    next(error);
  }
});

// POST /api/job-logs/analyze — preview analysis without saving
router.post('/job-logs/analyze', requireAuth, (req, res) => {
  const { rawText } = req.body;
  if (!rawText?.trim()) return res.status(400).json({ message: 'rawText is required.' });
  res.json(analyzeJobLog(rawText));
});

export default router;
