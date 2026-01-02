import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/overview', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [orders, users, books] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { book: true } } },
      }),
      prisma.user.count(),
      prisma.book.count(),
    ]);

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;
    const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly sales for last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    const monthlyMap = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(label, 0);
    }
    orders.forEach((o) => {
      const created = new Date(o.createdAt);
      if (created >= sixMonthsAgo) {
        const label = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap.has(label)) {
          monthlyMap.set(label, (monthlyMap.get(label) || 0) + Number(o.total));
        }
      }
    });
    const monthly = Array.from(monthlyMap.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([month, total]) => ({ month, total }));

    // Top books by quantity sold (exclude cancelled)
    const orderItems = await prisma.orderItem.findMany({
      include: { book: true, order: true },
    });
    const soldMap = new Map<
      string,
      { title: string; sold: number; revenue: number }
    >();
    orderItems.forEach((item) => {
      if (item.order.status === 'cancelled') return;
      const key = item.bookId;
      const entry = soldMap.get(key) || { title: item.book.title, sold: 0, revenue: 0 };
      entry.sold += item.quantity;
      entry.revenue += Number(item.price) * item.quantity;
      soldMap.set(key, entry);
    });
    const topBooks = Array.from(soldMap.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    res.json({
      totalSales,
      orderCount,
      userCount: users,
      bookCount: books,
      statusCounts,
      monthly,
      topBooks,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
