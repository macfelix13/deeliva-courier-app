import { Router } from 'express';
import { db, nextId, persist, SERVICES } from '../store';
import { computeTrackState, statusToInitialStage, TRACK_STEPS } from '../lib/tracking';
import { matchesSearch, orderStatusLabel, orderTotal } from '../lib/orders';
import { Order, OrderItem } from '../types';

export const ordersRouter = Router();

function toListItem(order: Order) {
  return {
    id: order.id,
    ref: order.ref,
    title: order.title,
    leg: `${order.pickupAddress.split(',')[0]} → ${order.dropAddress.split(',')[0]}`,
    date: new Date(order.bookedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    status: orderStatusLabel(order.status),
    price: `£${orderTotal(order).toFixed(2)}`,
  };
}

ordersRouter.get('/orders', (req, res) => {
  const q = String(req.query.q ?? '');
  const filters = String(req.query.filters ?? '').split(',').filter(Boolean);
  const results = db.orders
    .filter((o) => matchesSearch(o, q, filters))
    .sort((a, b) => b.bookedAt - a.bookedAt);
  res.json({
    count: results.length,
    results: results.map(toListItem),
    summary: `${db.orders.length} shipments · £${db.orders.reduce((s, o) => s + orderTotal(o), 0).toFixed(2)}`,
  });
});

ordersRouter.get('/orders/:id', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json({ ...order, total: orderTotal(order), statusLabel: orderStatusLabel(order.status) });
});

ordersRouter.post('/orders', (req, res) => {
  const { items, window, dropAddress, paymentMethodId, pickupAddress } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'items is required' });
    return;
  }

  const priced: OrderItem[] = items.map((raw: any) => {
    const service = SERVICES.find((s) => s.id === raw.serviceId) ?? SERVICES[1];
    const weightKg = Number(raw.weightKg) || 0.5;
    const cover = Boolean(raw.cover);
    const overweightFee = weightKg > 10 ? 4 : 0;
    const price = Math.round((service.price + overweightFee + (cover ? 1.8 : 0)) * 100) / 100;
    return { id: nextId('item'), name: raw.name ?? service.name, serviceId: service.id, weightKg, cover, price };
  });

  const order: Order = {
    id: nextId('order'),
    ref: `DLV-${4500 + db.orders.length}`,
    customerId: db.users.customer.id,
    title: priced[0].name,
    blurb: priced.length > 1 ? `${priced.length} parcels in this shipment.` : '',
    specs: [],
    items: priced,
    pickupAddress: pickupAddress || db.users.customer.addresses.find((a) => a.isDefault)?.line || 'Barrow Works, Unit 4, LS11 5DZ',
    dropAddress: dropAddress || 'Wellington Place, 6th floor, LS1 4AP',
    window: window || 'Next 60 minutes',
    paymentMethodId: paymentMethodId || 'card',
    status: 'booked',
    bookedAt: Date.now(),
    etaBaseMinutes: 34,
    courierId: null,
    courierName: 'Ray Okafor',
    courierRating: 4.9,
    courierDrops: 1208,
  };

  db.orders.unshift(order);
  persist();
  res.status(201).json({ ...order, total: orderTotal(order) });
});

ordersRouter.get('/orders/:id/tracking', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  const { stage, eta } = order.status === 'delivered' || order.status === 'refunded'
    ? { stage: 3, eta: 0 }
    : computeTrackState(order.bookedAt, order.etaBaseMinutes, statusToInitialStage(order.status));

  res.json({
    ref: order.ref,
    stage,
    eta,
    stageLabel: stage >= 3 ? 'Delivered' : ['Booked, finding a courier', 'Ray is on his way to you', 'Out for delivery', 'Delivered'][stage],
    steps: TRACK_STEPS.map((s) => ({
      ...s,
      time: s.stage < stage ? 'earlier' : s.stage === stage && stage < 3 ? 'now' : s.stage === 3 && stage === 3 ? 'now' : '—',
    })),
    courier: { name: order.courierName, rating: order.courierRating, drops: order.courierDrops },
    route: { pickup: order.pickupAddress, drop: order.dropAddress },
  });
});
