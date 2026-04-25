import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import datasetsRouter from './routes/datasets.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', datasetsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);

  const statusCode = error.message?.includes('Unsupported file format') ? 400 : 500;
  const message =
    statusCode === 500 ? 'Something went wrong while processing the dataset.' : error.message;

  res.status(statusCode).json({
    message,
  });
});

app.listen(port, () => {
  console.log(`InsightFlow API running on port ${port}`);
});
