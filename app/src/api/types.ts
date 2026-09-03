export type Role = 'customer' | 'courier';

export interface Address {
  id: string;
  label: string;
  line: string;
  notes: string;
  isDefault: boolean;
}

export interface SessionResponse {
  role: Role;
  user: { id: string; role: Role; name: string; sub: string; phone: string; addresses: Address[] };
}

export interface OnboardingState {
  phone: string;
  pickup: string;
  notes: string;
  completedAt: number | null;
  suggestions: string[];
}

export interface Service {
  id: string;
  name: string;
  window: string;
  price: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  detail: string;
}

export interface Quote {
  serviceId: string;
  basePrice: number;
  overweightFee: number;
  coverFee: number;
  total: number;
}

export interface HomeResponse {
  greetingName: string;
  active: { orderId: string; ref: string; stageLabel: string; etaMinutes: number; stage: number } | null;
  routes: { name: string; leg: string; fromPrice: number }[];
}

export interface OrderListItem {
  id: string;
  ref: string;
  title: string;
  leg: string;
  date: string;
  status: string;
  price: string;
}

export interface OrdersResponse {
  count: number;
  results: OrderListItem[];
  summary: string;
}

export interface OrderItemInput {
  name: string;
  serviceId: string;
  weightKg: number;
  cover: boolean;
}

export interface CreatedOrder {
  id: string;
  ref: string;
  total: number;
}

export interface TrackingResponse {
  ref: string;
  stage: number;
  eta: number;
  stageLabel: string;
  steps: { stage: number; label: string; note: string; time: string }[];
  courier: { name: string; rating: number; drops: number };
  route: { pickup: string; drop: string };
}

export interface ProfileStat {
  v: string;
  k: string;
}

export interface ProfileRow {
  id: string;
  label: string;
  note: string;
  val: string;
}

export interface ProfileResponse {
  name: string;
  sub: string;
  stats: ProfileStat[];
  rows: ProfileRow[];
}

export interface JobListItem {
  id: string;
  ref: string;
  kind: string;
  pickup: string;
  drop: string;
  pay: string;
  dist: string;
  window: string;
}

export interface JobsResponse {
  online: boolean;
  stats: ProfileStat[];
  list: JobListItem[];
  empty: boolean;
}

export interface ActiveDelivery {
  ref: string;
  stepIndex: number;
  stepLabel: string;
  title: string;
  cta: string;
  addrKicker: string;
  addr: string;
  note: string;
  isScan: boolean;
  isProof: boolean;
  isDone: boolean;
  receiver: string;
  proof: 'photo' | 'sign';
  payout: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  fromMe: boolean;
  text: string;
  createdAt: number;
}
