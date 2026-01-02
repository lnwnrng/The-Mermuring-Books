import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin, requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// --- Procurement orders ---
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.query as { status?: string };
    const where: any = {};
    if (status) where.status = status;
    const procurements = await prisma.procurement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        book: true,
        supplier: true,
      },
    });
    res.json(procurements);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { supplierId, bookId, quantity, expectedDate, note, status } = req.body as {
      supplierId?: string;
      bookId?: string;
      quantity?: number;
      expectedDate?: string;
      note?: string;
      status?: string;
    };
    if (!supplierId || !bookId || !quantity) {
      return res.status(400).json({ message: 'supplierId, bookId, quantity are required' });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: 'quantity must be positive' });
    }
    const targetStatus = status && ['open', 'ordered', 'received', 'cancelled'].includes(status) ? status : 'open';

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.procurement.create({
        data: {
          supplierId,
          bookId,
          quantity: qty,
          status: targetStatus as any,
          expectedDate: expectedDate ? new Date(expectedDate) : null,
          note: note || null,
        },
        include: { book: true, supplier: true },
      });

      if (created.status === 'received') {
        await tx.book.update({
          where: { id: bookId },
          data: { stock: { increment: qty } },
        });
        await tx.inventoryLog.create({
          data: {
            bookId,
            change: qty,
            reason: 'purchase',
            refId: created.id,
          },
        });
      }
      return created;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body as { status?: string };
    const allowed = ['open', 'ordered', 'received', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'invalid status' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.procurement.findUnique({
        where: { id: req.params.id },
      });
      if (!existing) {
        throw Object.assign(new Error('Not found'), { statusCode: 404 });
      }
      // If already received, prevent duplicate stock increments
      if (existing.status === 'received' && status === 'received') {
        return existing;
      }

      const saved = await tx.procurement.update({
        where: { id: req.params.id },
        data: { status: status as any },
      });

      if (status === 'received' && existing.status !== 'received') {
        await tx.book.update({
          where: { id: existing.bookId },
          data: { stock: { increment: existing.quantity } },
        });
        await tx.inventoryLog.create({
          data: {
            bookId: existing.bookId,
            change: existing.quantity,
            reason: 'purchase',
            refId: existing.id,
          },
        });
      }

      return saved;
    });

    res.json(updated);
  } catch (err: any) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
});

// --- Missing book requests ---
router.get('/requests', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const requests = await prisma.missingRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

router.post('/requests', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { title, author, note } = req.body as { title?: string; author?: string; note?: string };
    if (!title) {
      return res.status(400).json({ message: 'title required' });
    }

    let contactName: string | undefined;
    let contactEmail: string | undefined;
    if (req.user?.id) {
      const profile = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true, email: true },
      });
      contactName = profile?.name || undefined;
      contactEmail = profile?.email || undefined;
    }

    const request = await prisma.missingRequest.create({
      data: {
        title,
        author,
        note,
        userId: req.user?.id,
        contactName,
        contactEmail,
      },
    });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

router.patch('/requests/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body as { status?: string };
    const allowed = ['open', 'reviewing', 'ordered', 'stocked', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'invalid status' });
    }
    const updated = await prisma.missingRequest.update({
      where: { id: req.params.id },
      data: { status: status as any },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
