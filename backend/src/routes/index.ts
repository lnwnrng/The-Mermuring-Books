import { Router } from 'express';
import authRoutes from './authRoutes';
import bookRoutes from './bookRoutes';
import procurementRoutes from './procurementRoutes';
import customerRoutes from './customerRoutes';
import orderRoutes from './orderRoutes';
import supplierRoutes from './supplierRoutes';
import catalogRoutes from './catalogRoutes';
import statsRoutes from './statsRoutes';
import favoriteRoutes from './favoriteRoutes';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.get('/health/db', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/procurements', procurementRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/catalog', catalogRoutes);
router.use('/stats', statsRoutes);
router.use('/favorites', favoriteRoutes);

export default router;
