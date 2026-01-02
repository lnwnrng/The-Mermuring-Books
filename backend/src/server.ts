import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import router from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Yiyu Bookstore API', docs: '/api/health' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});
