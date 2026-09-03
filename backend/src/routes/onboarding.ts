import { Router } from 'express';
import { ADDRESS_SUGGESTIONS, db, nextId, persist } from '../store';
import { wrap } from '../lib/asyncHandler';

export const onboardingRouter = Router();

onboardingRouter.get('/onboarding', (_req, res) => {
  res.json({ ...db.onboarding, suggestions: ADDRESS_SUGGESTIONS });
});

onboardingRouter.patch('/onboarding', wrap(async (req, res) => {
  const { phone, pickup, notes } = req.body ?? {};
  if (typeof phone === 'string') db.onboarding.phone = phone;
  if (typeof pickup === 'string') db.onboarding.pickup = pickup;
  if (typeof notes === 'string') db.onboarding.notes = notes;
  await persist();
  res.json({ ...db.onboarding, suggestions: ADDRESS_SUGGESTIONS });
}));

onboardingRouter.post('/onboarding/complete', wrap(async (_req, res) => {
  const customer = db.users.customer;
  const line = db.onboarding.pickup || 'Barrow Works, Unit 4, LS11 5DZ';
  const notes = db.onboarding.notes || 'Loading bay, buzzer 4';
  customer.phone = db.onboarding.phone;
  const existing = customer.addresses.find((a) => a.isDefault);
  if (existing) {
    existing.line = line;
    existing.notes = notes;
  } else {
    customer.addresses.unshift({ id: nextId('addr'), label: 'Default pickup', line, notes, isDefault: true });
  }
  db.onboarding.completedAt = Date.now();
  await persist();
  res.json({
    pickupOut: line,
    notesOut: notes,
    nearbyCouriers: 14,
    typicalFirstPickupMinutes: 40,
  });
}));
