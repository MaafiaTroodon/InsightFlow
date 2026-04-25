import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import datasetsRouter from './routes/datasets.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:5173',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed.'));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use('/api', uploadRouter);
app.use('/api', datasetsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);

  const statusCode =
    error.status ||
    (error.code === 'LIMIT_FILE_SIZE' ? 400 : error.message?.includes('Unsupported file format') ? 400 : 500);
  const message =
    statusCode === 500 ? 'Something went wrong while processing the dataset.' : error.message;

  res.status(statusCode).json({
    message,
  });
});

app.listen(port, () => {
  console.log(`InsightFlow API running on port ${port}`);
});
