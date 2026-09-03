import { Router } from 'express';
import { db, persist } from '../store';
import { wrap } from '../lib/asyncHandler';

export const sessionRouter = Router();

sessionRouter.get('/session', (_req, res) => {
  res.json({ role: db.activeRole, user: db.users[db.activeRole] });
});

sessionRouter.patch('/session', wrap(async (req, res) => {
  const { role } = req.body ?? {};
  if (role !== 'customer' && role !== 'courier') {
    res.status(400).json({ error: 'role must be "customer" or "courier"' });
    return;
  }
  db.activeRole = role;
  await persist();
  res.json({ role: db.activeRole, user: db.users[db.activeRole] });
}));
