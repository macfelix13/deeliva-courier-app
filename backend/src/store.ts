import fs from 'fs';
import path from 'path';
import {
  Address, ChatMessage, Job, Order, PaymentMethod, Role, Service, UserProfile,
} from './types';
import { computeTrackState, statusToInitialStage } from './lib/tracking';

// re-exported for routes that only need the Job shape
export type { Job };

const DATA_FILE = path.join(__dirname, '..', 'data.json');

export const SERVICES: Service[] = [
  { id: 'sameday', name: 'Same day', window: 'Collected by 12:00 · dropped by 18:00', price: 14.4 },
  { id: 'express', name: 'Express 2 hr', window: 'Direct, no depot · live tracking', price: 22.5 },
  { id: 'next', name: 'Next morning', window: 'Before 10:00 tomorrow', price: 8.9 },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card', name: 'Business card', detail: '•••• 4417' },
  { id: 'credit', name: 'Deeliva credit', detail: '£38.20 left' },
];

export const ADDRESS_SUGGESTIONS = ['Barrow Works, Unit 4', 'Home · 12 Cardigan Rd', 'Holbeck depot'];

export const JOB_TEMPLATES: Array<Pick<Job, 'ref' | 'kind' | 'pickupAddress' | 'dropAddress' | 'pay' | 'distanceKm' | 'etaMinutes' | 'pickupByLabel'>> = [
  { ref: 'DLV-4471', kind: 'Express', pickupAddress: 'Barrow Works, Unit 4', dropAddress: 'Wellington Pl, LS1', pay: 9.2, distanceKm: 4.2, etaMinutes: 14, pickupByLabel: 'pick up by 11:40' },
  { ref: 'DLV-4482', kind: 'Same day', pickupAddress: 'Crown Point Retail', dropAddress: 'Chapel Allerton', pay: 6.8, distanceKm: 5.9, etaMinutes: 19, pickupByLabel: 'pick up by 13:00' },
  { ref: 'DLV-4490', kind: 'Bulk · 3 parcels', pickupAddress: 'Holbeck depot', dropAddress: 'Three stops, LS6', pay: 17.5, distanceKm: 11.4, etaMinutes: 38, pickupByLabel: 'pick up by 14:15' },
];

export function freshJobs(): Job[] {
  return JOB_TEMPLATES.map((t) => ({
    ...t,
    id: nextId('job'),
    status: 'open',
    courierId: null,
    orderId: null,
    deliveryStep: 0,
    receiver: '',
    proof: 'photo',
  }));
}

let uid = 1000;
export function nextId(prefix: string) {
  uid += 1;
  return `${prefix}_${uid}`;
}

export interface Db {
  activeRole: Role;
  users: Record<Role, UserProfile>;
  onboarding: { phone: string; pickup: string; notes: string; completedAt: number | null };
  orders: Order[];
  jobs: Job[];
  messages: ChatMessage[];
  online: boolean;
}

function seed(): Db {
  const customerId = 'user_customer';
  const courierId = 'user_courier';

  const customerAddresses: Address[] = [
    { id: nextId('addr'), label: 'Barrow Works', line: 'Barrow Works, Unit 4, LS11 5DZ', notes: 'Loading bay, buzzer 4', isDefault: true },
    { id: nextId('addr'), label: 'Home', line: '12 Cardigan Rd, LS6', notes: '', isDefault: false },
    { id: nextId('addr'), label: 'Holbeck depot', line: 'Holbeck depot, LS11', notes: '', isDefault: false },
  ];

  const now = Date.now();

  const orders: Order[] = [
    {
      id: nextId('order'), ref: 'DLV-4471', customerId,
      title: 'Rolled drawings tube',
      blurb: 'Long, light and awkward — couriers carry it upright, so it goes direct with no depot handling.',
      specs: [{ k: 'Type', v: 'Tube' }, { k: 'Length', v: '910 mm' }, { k: 'Diameter', v: '110 mm' }, { k: 'Girth class', v: 'C · oversize' }],
      items: [{ id: nextId('item'), name: 'Rolled drawings tube', serviceId: 'express', weightKg: 2.5, cover: true, price: 22.5 }],
      pickupAddress: 'Barrow Works, Unit 4, LS11 5DZ',
      dropAddress: 'Wellington Place, 6th floor, LS1 4AP',
      window: '11:00 – 13:00', paymentMethodId: 'card',
      status: 'on_the_way',
      bookedAt: now, etaBaseMinutes: 26,
      courierId, courierName: 'Ray Okafor', courierRating: 4.9, courierDrops: 1208,
    },
    {
      id: nextId('order'), ref: 'DLV-4390', customerId,
      title: 'Two sample boxes', blurb: 'Two boxes of material samples for a client walkthrough.',
      specs: [{ k: 'Type', v: 'Boxes' }, { k: 'Count', v: '2' }, { k: 'Weight', v: '4.0 kg' }, { k: 'Girth class', v: 'B' }],
      items: [{ id: nextId('item'), name: 'Two sample boxes', serviceId: 'sameday', weightKg: 4, cover: false, price: 14.4 }],
      pickupAddress: 'Barrow Works, Unit 4, LS11 5DZ', dropAddress: 'Kirkstall Rd, LS4',
      window: '16:00 – 18:00', paymentMethodId: 'card',
      status: 'delivered', bookedAt: now - 2 * 24 * 60 * 60 * 1000, etaBaseMinutes: 40,
      courierId, courierName: 'Ray Okafor', courierRating: 4.9, courierDrops: 1208,
    },
    {
      id: nextId('order'), ref: 'DLV-4288', customerId,
      title: 'Signed contracts', blurb: 'Time-sensitive paperwork for Park Square East.',
      specs: [{ k: 'Type', v: 'Envelope' }, { k: 'Weight', v: '0.3 kg' }, { k: 'Girth class', v: 'A' }, { k: 'Cover', v: 'None' }],
      items: [{ id: nextId('item'), name: 'Signed contracts', serviceId: 'express', weightKg: 0.3, cover: false, price: 22.5 }],
      pickupAddress: 'Home · 12 Cardigan Rd, LS6', dropAddress: 'Park Sq East, LS1',
      window: 'Next 60 minutes', paymentMethodId: 'card',
      status: 'delivered', bookedAt: now - 6 * 24 * 60 * 60 * 1000, etaBaseMinutes: 22,
      courierId, courierName: 'Ray Okafor', courierRating: 4.9, courierDrops: 1208,
    },
    {
      id: nextId('order'), ref: 'DLV-4210', customerId,
      title: 'Return: faulty sensor', blurb: 'Faulty unit going back to the supplier depot.',
      specs: [{ k: 'Type', v: 'Box' }, { k: 'Weight', v: '1.1 kg' }, { k: 'Girth class', v: 'A' }, { k: 'Cover', v: 'None' }],
      items: [{ id: nextId('item'), name: 'Return: faulty sensor', serviceId: 'next', weightKg: 1.1, cover: false, price: 8.9 }],
      pickupAddress: 'Holbeck depot, LS11', dropAddress: 'Supplier depot',
      window: 'Next morning', paymentMethodId: 'credit',
      status: 'refunded', bookedAt: now - 8 * 24 * 60 * 60 * 1000, etaBaseMinutes: 30,
      courierId: null, courierName: 'Ray Okafor', courierRating: 4.9, courierDrops: 1208,
    },
    {
      id: nextId('order'), ref: 'DLV-4155', customerId,
      title: 'Trade counter order', blurb: 'Large trade order between two Leeds sites.',
      specs: [{ k: 'Type', v: 'Pallet box' }, { k: 'Weight', v: '18 kg' }, { k: 'Girth class', v: 'D · oversize' }, { k: 'Cover', v: 'To £500' }],
      items: [{ id: nextId('item'), name: 'Trade counter order', serviceId: 'sameday', weightKg: 18, cover: true, price: 14.4 }],
      pickupAddress: 'Armley, LS12', dropAddress: 'Bramley, LS13',
      window: '11:00 – 13:00', paymentMethodId: 'card',
      status: 'delivered', bookedAt: now - 12 * 24 * 60 * 60 * 1000, etaBaseMinutes: 45,
      courierId, courierName: 'Ray Okafor', courierRating: 4.9, courierDrops: 1208,
    },
  ];

  const jobs: Job[] = freshJobs();

  const messages: ChatMessage[] = [
    { id: nextId('msg'), role: 'customer', fromMe: false, text: 'Hi Nadia — Ray is two streets away. Anything he should know?', createdAt: now - 180000 },
    { id: nextId('msg'), role: 'customer', fromMe: true, text: 'Reception closes at 17:30, ask for Tom on the 6th.', createdAt: now - 120000 },
    { id: nextId('msg'), role: 'customer', fromMe: false, text: 'Passed it on. He will call from the door.', createdAt: now - 60000 },
    { id: nextId('msg'), role: 'courier', fromMe: false, text: 'Welcome back Ray — let us know if a drop-off address looks wrong.', createdAt: now - 60000 },
  ];

  return {
    activeRole: 'customer',
    users: {
      customer: {
        id: customerId, role: 'customer', name: 'Nadia Whitcombe', sub: 'Barrow Works · business account',
        phone: '', addresses: customerAddresses,
      },
      courier: {
        id: courierId, role: 'courier', name: 'Ray Okafor', sub: 'Courier #2214 · Leeds zone',
        phone: '', addresses: [],
      },
    },
    onboarding: { phone: '', pickup: '', notes: '', completedAt: now - 30 * 24 * 60 * 60 * 1000 },
    orders,
    jobs,
    messages,
    online: true,
  };
}

/**
 * The demo "active shipment" rides from booked to delivered in ~90 real
 * seconds (the prototype's fast simulated clock — see lib/tracking.ts).
 * Once it's ridden that out, restarting the server should show a fresh
 * in-transit shipment again rather than a permanently "delivered" one.
 */
function refreshStaleDemoOrder(data: Db) {
  const active = data.orders.find((o) => o.status === 'on_the_way');
  if (!active) return;
  const { stage } = computeTrackState(active.bookedAt, active.etaBaseMinutes, statusToInitialStage(active.status));
  if (stage >= 3) {
    active.bookedAt = Date.now();
    active.etaBaseMinutes = 26;
  }
}

function load(): Db {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      refreshStaleDemoOrder(data);
      return data;
    } catch {
      // fall through to reseed on a corrupt file
    }
  }
  return seed();
}

export const db: Db = load();

let saveTimer: NodeJS.Timeout | null = null;
export function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  }, 200);
}

export function resetDb() {
  Object.assign(db, seed());
  persist();
}
