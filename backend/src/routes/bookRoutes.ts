import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Catalog & stock - public list
router.get('/', async (req, res, next) => {
  try {
    const { q, category } = req.query as { q?: string; category?: string };
    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { isbn: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(books);
  } catch (err) {
    next(err);
  }
});

// Low stock list - admin
router.get('/low-stock', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 5;
    const books = await prisma.book.findMany({
      where: {
        stock: { lte: threshold },
      },
      orderBy: { stock: 'asc' },
    });
    res.json(books);
  } catch (err) {
    next(err);
  }
});

// Categories (distinct)
router.get('/categories', async (_req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      select: { category: true },
    });
    const map = new Map<string, number>();
    books.forEach((b) => {
      if (!b.category) return;
      b.category.split('·').map((c) => c.trim()).filter(Boolean).forEach((c) => {
        map.set(c, (map.get(c) || 0) + 1);
      });
    });
    const categories = Array.from(map.entries()).map(([category, count]) => ({ category, count }));
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// Create book - admin only
router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { title, author, publisher, isbn, price, category, coverUrl, description, stock, publishDate } = req.body;
    if (!title || !author || !isbn || price === undefined || !category) {
      return res.status(400).json({ message: 'title, author, isbn, price, category are required' });
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        publisher: publisher || null,
        isbn,
        price: Number(price),
        category,
        coverUrl: coverUrl || null,
        description: description || null,
        stock: stock !== undefined ? Number(stock) : 0,
        publishDate: publishDate ? new Date(publishDate) : null,
      },
    });

    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

// Update book - admin only
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, publisher, isbn, price, category, coverUrl, description, stock, publishDate } = req.body;
    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        publisher,
        isbn,
        price: price !== undefined ? Number(price) : undefined,
        category,
        coverUrl,
        description,
        stock: stock !== undefined ? Number(stock) : undefined,
        publishDate: publishDate ? new Date(publishDate) : undefined,
      },
    });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// Delete book - admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.book.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
