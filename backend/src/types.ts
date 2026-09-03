export type Role = 'customer' | 'courier';

export interface Address {
  id: string;
  label: string;
  line: string;
  notes: string;
  isDefault: boolean;
}

export interface Service {
  id: string;
  name: string;
  window: string;
  price: number;
}

export interface ParcelSpec {
  k: string;
  v: string;
}

export interface OrderItem {
  id: string;
  name: string;
  serviceId: string;
  weightKg: number;
  cover: boolean;
  price: number;
}

export type OrderStatus = 'booked' | 'collected' | 'on_the_way' | 'delivered' | 'refunded';

export interface TrackStep {
  stage: number;
  label: string;
  note: string;
}

export interface Order {
  id: string;
  ref: string;
  customerId: string;
  title: string;
  blurb: string;
  specs: ParcelSpec[];
  items: OrderItem[];
  pickupAddress: string;
  dropAddress: string;
  window: string;
  paymentMethodId: string;
  status: OrderStatus;
  bookedAt: number;
  etaBaseMinutes: number;
  courierId: string | null;
  courierName: string;
  courierRating: number;
  courierDrops: number;
}

export type JobStatus = 'open' | 'accepted' | 'skipped' | 'delivered';

export interface Job {
  id: string;
  ref: string;
  kind: string;
  pickupAddress: string;
  dropAddress: string;
  pay: number;
  distanceKm: number;
  etaMinutes: number;
  pickupByLabel: string;
  status: JobStatus;
  courierId: string | null;
  orderId: string | null;
  deliveryStep: number;
  receiver: string;
  proof: 'photo' | 'sign';
}

export interface ChatMessage {
  id: string;
  role: Role;
  fromMe: boolean;
  text: string;
  createdAt: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  detail: string;
}

export interface UserProfile {
  id: string;
  role: Role;
  name: string;
  sub: string;
  phone: string;
  addresses: Address[];
}
