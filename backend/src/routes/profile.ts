import { Router } from 'express';
import { db } from '../store';
import { orderTotal } from '../lib/orders';

export const profileRouter = Router();

profileRouter.get('/profile', (req, res) => {
  const role = req.query.role === 'courier' ? 'courier' : 'customer';
  const user = db.users[role];

  if (role === 'customer') {
    const parcelsSent = db.orders.length;
    const credit = 38;
    const onTime = 100;
    res.json({
      name: user.name,
      sub: user.sub,
      stats: [
        { v: String(parcelsSent), k: 'parcels sent' },
        { v: `£${credit}`, k: 'credit left' },
        { v: `${onTime}%`, k: 'on time' },
      ],
      rows: [
        { id: 'addresses', label: 'Addresses', note: `${user.addresses.length} saved · ${user.addresses.find((a) => a.isDefault)?.label ?? 'none'} default`, val: 'edit' },
        { id: 'payment', label: 'Payment', note: 'Business card •••• 4417', val: 'edit' },
        { id: 'notifications', label: 'Notifications', note: 'Texts on pickup and drop-off', val: 'on' },
        { id: 'invoices', label: 'Invoices', note: 'Monthly, sent to accounts@', val: 'view' },
        { id: 'help', label: 'Help centre', note: 'Guides, sizes and prohibited items', val: 'open' },
        { id: 'chat', label: 'Talk to us', note: 'Chat with support', val: 'chat' },
      ],
    });
    return;
  }

  const totalPayout = db.orders.filter((o) => o.courierId === user.id).reduce((s, o) => s + orderTotal(o), 0);
  res.json({
    name: user.name,
    sub: user.sub,
    stats: [
      { v: '1,208', k: 'drops' },
      { v: '4.9', k: 'rating' },
      { v: `£${totalPayout.toFixed(0)}`, k: 'this week' },
    ],
    rows: [
      { id: 'vehicle', label: 'Vehicle', note: 'Transit van · LS22 4XR', val: 'edit' },
      { id: 'payouts', label: 'Payouts', note: 'Bank •••• 0192 · weekly', val: 'edit' },
      { id: 'documents', label: 'Documents', note: 'Licence & insurance · valid to Mar 27', val: 'view' },
      { id: 'availability', label: 'Availability', note: 'Leeds zone · Mon–Sat', val: 'edit' },
      { id: 'tax', label: 'Tax summary', note: 'Self-employed statements', val: 'view' },
      { id: 'chat', label: 'Talk to us', note: 'Chat with support', val: 'chat' },
    ],
  });
});
