import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin: list all orders
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { book: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// User: my orders
router.get('/mine', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { book: true } } },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Create order (user or guest)
router.post('/', async (req, res, next) => {
  try {
    const { items, contact, paymentMethod, subtotal, shippingFee, total, userId } = req.body as any;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items required' });
    }
    if (!contact?.name || !contact?.phone || !contact?.region || !contact?.address) {
      return res.status(400).json({ message: 'contact info incomplete' });
    }
    const shippingFeeNum = Number(shippingFee ?? 0);

    // Aggregate quantities by bookId
    const qtyMap: Record<string, { count: number; price: number }> = {};
    for (const item of items) {
      if (!item.id) return res.status(400).json({ message: 'item.id (book id) is required' });
      const price = Number(item.price ?? 0);
      if (!qtyMap[item.id]) qtyMap[item.id] = { count: 0, price };
      qtyMap[item.id].count += 1;
      qtyMap[item.id].price = price;
    }

    const bookIds = Object.keys(qtyMap);
    const dbBooks = await prisma.book.findMany({ where: { id: { in: bookIds } } });
    if (dbBooks.length !== bookIds.length) {
      return res.status(400).json({ message: 'Some books not found' });
    }

    // Check stock
    for (const b of dbBooks) {
      if (qtyMap[b.id].count > b.stock) {
        return res.status(400).json({ message: `库存不足: ${b.title}` });
      }
    }

    const calcSubtotal = dbBooks.reduce((sum, b) => sum + Number(b.price) * qtyMap[b.id].count, 0);
    const orderTotal = calcSubtotal + shippingFeeNum;

    // If balance payment, check user and balance first
    let userBalanceBefore: number | null = null;
    if (paymentMethod === 'balance' && userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(400).json({ message: 'User not found for balance payment' });
      userBalanceBefore = Number(user.balance);
      if (userBalanceBefore < orderTotal) {
        return res.status(400).json({ message: '余额不足' });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: userId || undefined,
          status: 'pending',
          subtotal: calcSubtotal,
          shippingFee: shippingFeeNum,
          total: orderTotal,
          paymentMethod: paymentMethod || 'balance',
          contactName: contact.name,
          contactPhone: contact.phone,
          region: contact.region,
          address: contact.address,
          items: {
            create: dbBooks.map((b) => ({
              bookId: b.id,
              quantity: qtyMap[b.id].count,
              price: b.price,
            })),
          },
        },
        include: { items: { include: { book: true } }, user: { select: { id: true, name: true, email: true } } },
      });

      // Deduct balance if needed
      let updatedBalance: number | null = null;
      if (paymentMethod === 'balance' && userId) {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: orderTotal } },
          select: { balance: true },
        });
        updatedBalance = Number(updatedUser.balance);
      }

      // Deduct stock and write inventory logs
      for (const b of dbBooks) {
        await tx.book.update({
          where: { id: b.id },
          data: { stock: b.stock - qtyMap[b.id].count },
        });
        await tx.inventoryLog.create({
          data: {
            bookId: b.id,
            change: -qtyMap[b.id].count,
            reason: 'sale',
            refId: created.id,
          },
        });
      }
      return { created, updatedBalance };
    });

    res.status(201).json({ order: result.created, balance: result.updatedBalance ?? undefined });
  } catch (err) {
    next(err);
  }
});

// Update status - admin
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    const allowed = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: { include: { book: true } } },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
