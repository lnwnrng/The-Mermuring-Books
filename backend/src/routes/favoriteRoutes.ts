import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get my favorites
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { book: true },
    });
    res.json(favorites);
  } catch (err) {
    next(err);
  }
});

// Add to favorites (idempotent)
router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { bookId } = req.body as { bookId?: string };
    if (!bookId) return res.status(400).json({ message: 'bookId required' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const favorite = await prisma.favorite.upsert({
      where: { userId_bookId: { userId: req.user!.id, bookId } },
      update: {},
      create: { userId: req.user!.id, bookId },
      include: { book: true },
    });
    res.status(201).json(favorite);
  } catch (err) {
    next(err);
  }
});

// Remove from favorites
router.delete('/:bookId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const result = await prisma.favorite.deleteMany({
      where: { userId: req.user!.id, bookId },
    });
    if (result.count === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
