import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, signToken, verifyPassword } from '../utils/auth';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'email, password, name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'user',
        creditLevel: '60',
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...userSafe } = user;
    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (err) {
    next(err);
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditLevel: true,
        balance: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update current user profile (basic fields)
router.patch('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, phone, avatar } = req.body as { name?: string; phone?: string; avatar?: string | null };
    const avatarValue = avatar === '' ? null : avatar ?? undefined;
    const phoneValue = phone === '' ? null : phone ?? undefined;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: name ?? undefined,
        phone: phoneValue,
        avatar: avatarValue,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditLevel: true,
        balance: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Recharge balance for current user
router.patch('/me/balance', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { amount } = req.body as { amount?: number };
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ message: 'amount must be greater than 0' });
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { balance: { increment: value } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditLevel: true,
        balance: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
