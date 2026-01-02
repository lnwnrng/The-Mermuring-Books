import { Router } from 'express';

const router = Router();

router.get('/browse', (_req, res) => {
  res.status(501).json({ message: 'Public browsing not implemented' });
});

router.get('/featured', (_req, res) => {
  res.status(501).json({ message: 'Featured items not implemented' });
});

export default router;
