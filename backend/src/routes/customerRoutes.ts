import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// List customers (admin)
router.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        creditLevel: true,
        balance: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// List customer orders
router.get('/:id/orders', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { book: true } } },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Adjust credit level
router.patch('/:id/credit', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { creditLevel } = req.body as { creditLevel?: string };
    if (!creditLevel) {
      return res.status(400).json({ message: 'creditLevel required' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { creditLevel },
      select: {
        id: true,
        email: true,
        name: true,
        creditLevel: true,
        balance: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Adjust balance (delta)
router.patch('/:id/balance', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { delta } = req.body as { delta?: number };
    if (delta === undefined) {
      return res.status(400).json({ message: 'delta required' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { balance: { increment: Number(delta) } },
      select: {
        id: true,
        email: true,
        name: true,
        creditLevel: true,
        balance: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
