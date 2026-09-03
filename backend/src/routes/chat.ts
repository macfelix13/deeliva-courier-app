import { Router } from 'express';
import { db, nextId, persist } from '../store';
import { wrap } from '../lib/asyncHandler';
import { Role } from '../types';

export const chatRouter = Router();

const AUTO_REPLY = 'Got it — checking with the courier now. Give me a moment.';

function roleOf(req: any): Role {
  return req.query.role === 'courier' ? 'courier' : 'customer';
}

chatRouter.get('/chat', (req, res) => {
  const role = roleOf(req);
  res.json({
    messages: db.messages.filter((m) => m.role === role).sort((a, b) => a.createdAt - b.createdAt),
  });
});

chatRouter.post('/chat', wrap(async (req, res) => {
  const role: Role = req.body?.role === 'courier' ? 'courier' : 'customer';
  const text = String(req.body?.text ?? '').trim();
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  db.messages.push({ id: nextId('msg'), role, fromMe: true, text, createdAt: Date.now() });
  db.messages.push({ id: nextId('msg'), role, fromMe: false, text: AUTO_REPLY, createdAt: Date.now() + 900 });
  await persist();
  res.status(201).json({
    messages: db.messages.filter((m) => m.role === role).sort((a, b) => a.createdAt - b.createdAt),
  });
}));
