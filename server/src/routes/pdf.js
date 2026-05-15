import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/requireAuth.js';
import { extractPdfData } from '../services/pdfService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Only PDF files are accepted.'), { status: 400 }));
    }
  },
});

// POST /api/pdf/extract
// Accepts a real PDF upload, extracts invoice/document data, returns structured fields + confidence
router.post('/pdf/extract', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'A PDF file is required.' });
    }

    const result = await extractPdfData(req.file.buffer);

    res.json({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/pdf/extract-multi
// Accepts up to 5 PDFs at once, returns array of results
router.post('/pdf/extract-multi', requireAuth, upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: 'At least one PDF file is required.' });
    }

    const results = await Promise.allSettled(
      req.files.map(async (file) => {
        const data = await extractPdfData(file.buffer);
        return { fileName: file.originalname, fileSize: file.size, ...data };
      })
    );

    const parsed = results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : { fileName: req.files[i].originalname, error: r.reason?.message || 'Extraction failed' }
    );

    res.json({ results: parsed, total: parsed.length });
  } catch (error) {
    next(error);
  }
});

export default router;
