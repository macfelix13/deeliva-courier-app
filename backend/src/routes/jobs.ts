import { Router } from 'express';
import { db, freshJobs, persist } from '../store';
import { wrap } from '../lib/asyncHandler';

export const jobsRouter = Router();

function toListItem(j: (typeof db.jobs)[number]) {
  return {
    id: j.id, ref: j.ref, kind: j.kind,
    pickup: j.pickupAddress, drop: j.dropAddress,
    pay: `£${j.pay.toFixed(2)}`, dist: `${j.distanceKm} km · ${j.etaMinutes} min`,
    window: j.pickupByLabel,
  };
}

jobsRouter.get('/jobs', (_req, res) => {
  const courier = db.users.courier;
  const openJobs = db.jobs.filter((j) => j.status === 'open');
  const weeklyEarnings = db.jobs.filter((j) => j.status === 'delivered' && j.courierId === courier.id)
    .reduce((s, j) => s + j.pay, 0);
  res.json({
    online: db.online,
    stats: [
      { v: `£${(weeklyEarnings || 142).toFixed(0)}`, k: 'earned this week' },
      { v: String(db.jobs.filter((j) => j.status === 'delivered').length || 6), k: 'drops today' },
      { v: '98%', k: 'on time' },
    ],
    list: openJobs.map(toListItem),
    empty: openJobs.length === 0,
  });
});

jobsRouter.patch('/courier/online', wrap(async (req, res) => {
  const { online } = req.body ?? {};
  db.online = Boolean(online);
  await persist();
  res.json({ online: db.online });
}));

jobsRouter.post('/jobs/:id/accept', wrap(async (req, res) => {
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job || job.status !== 'open') {
    res.status(404).json({ error: 'job not available' });
    return;
  }
  job.status = 'accepted';
  job.courierId = db.users.courier.id;
  job.deliveryStep = 0;
  await persist();
  res.json({ id: job.id });
}));

jobsRouter.post('/jobs/:id/skip', wrap(async (req, res) => {
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  job.status = 'skipped';
  await persist();
  res.json({ id: job.id });
}));

jobsRouter.post('/jobs/refill', wrap(async (_req, res) => {
  const keep = db.jobs.filter((j) => j.status === 'accepted');
  db.jobs = keep.concat(freshJobs());
  await persist();
  res.json({ list: db.jobs.filter((j) => j.status === 'open').map(toListItem) });
}));
