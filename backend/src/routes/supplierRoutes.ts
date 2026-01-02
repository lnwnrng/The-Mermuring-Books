import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// List suppliers
router.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
});

// Create supplier
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, contact, phone, email, rating, note } = req.body as {
      name?: string;
      contact?: string;
      phone?: string;
      email?: string;
      rating?: number;
      note?: string;
    };
    if (!name) {
      return res.status(400).json({ message: 'name required' });
    }
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contact: contact || null,
        phone: phone || null,
        email: email || null,
        rating: rating !== undefined ? Number(rating) : null,
        note: note || null,
      },
    });
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
});

// Update supplier
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact, phone, email, rating, note } = req.body as {
      name?: string;
      contact?: string;
      phone?: string;
      email?: string;
      rating?: number;
      note?: string;
    };
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contact,
        phone,
        email,
        rating: rating !== undefined ? Number(rating) : undefined,
        note,
      },
    });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
});

// Delete supplier
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.supplier.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2003') {
        return res.status(400).json({ message: '该供应商存在关联记录，无法删除' });
      }
      if (err.code === 'P2025') {
        return res.status(404).json({ message: '供应商不存在或已被删除' });
      }
    }
    next(err);
  }
});

export default router;
