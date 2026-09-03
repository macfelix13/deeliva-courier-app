import { Router } from 'express';
import { db } from '../store';
import { computeTrackState, statusToInitialStage } from '../lib/tracking';

export const homeRouter = Router();

homeRouter.get('/home', (_req, res) => {
  const active = db.orders.find((o) => o.status !== 'delivered' && o.status !== 'refunded');
  let activeSummary = null;
  if (active) {
    const { stage, eta } = computeTrackState(active.bookedAt, active.etaBaseMinutes, statusToInitialStage(active.status));
    activeSummary = {
      orderId: active.id,
      ref: `${active.ref} · ${active.title}`,
      stageLabel: stage >= 3 ? 'Delivered' : ['Booked, finding a courier', 'Ray is on his way to you', 'Out for delivery', 'Delivered'][stage],
      etaMinutes: eta,
      stage,
    };
  }

  res.json({
    greetingName: db.users.customer.name.split(' ')[0],
    active: activeSummary,
    routes: [
      { name: 'Works → Wellington Pl', leg: 'LS11 → LS1 · 4.2 km', fromPrice: 22.5 },
      { name: 'Works → Kirkstall Rd', leg: 'LS11 → LS4 · 6.1 km', fromPrice: 14.4 },
    ],
  });
});
