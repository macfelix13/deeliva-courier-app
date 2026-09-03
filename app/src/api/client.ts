import { API_BASE_URL } from './config';
import {
  ActiveDelivery, ChatMessage, CreatedOrder, HomeResponse, JobsResponse, OnboardingState,
  OrderItemInput, OrdersResponse, PaymentMethod, ProfileResponse, Quote, Role, Service,
  SessionResponse, TrackingResponse,
} from './types';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${init?.method ?? 'GET'} ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

export const api = {
  getSession: () => apiFetch<SessionResponse>('/session'),
  setRole: (role: Role) => apiFetch<SessionResponse>('/session', { method: 'PATCH', body: JSON.stringify({ role }) }),

  getOnboarding: () => apiFetch<OnboardingState>('/onboarding'),
  patchOnboarding: (patch: Partial<Pick<OnboardingState, 'phone' | 'pickup' | 'notes'>>) =>
    apiFetch<OnboardingState>('/onboarding', { method: 'PATCH', body: JSON.stringify(patch) }),
  completeOnboarding: () =>
    apiFetch<{ pickupOut: string; notesOut: string; nearbyCouriers: number; typicalFirstPickupMinutes: number }>(
      '/onboarding/complete', { method: 'POST' },
    ),

  getServices: () => apiFetch<Service[]>('/services'),
  getPaymentMethods: () => apiFetch<PaymentMethod[]>('/payment-methods'),
  getQuote: (serviceId: string, weightKg: number, cover: boolean) =>
    apiFetch<Quote>('/quote', { method: 'POST', body: JSON.stringify({ serviceId, weightKg, cover }) }),

  getHome: () => apiFetch<HomeResponse>('/home'),

  searchOrders: (q: string, filters: string[]) =>
    apiFetch<OrdersResponse>(`/orders?q=${encodeURIComponent(q)}&filters=${encodeURIComponent(filters.join(','))}`),
  getOrder: (id: string) => apiFetch<any>(`/orders/${id}`),
  createOrder: (body: { items: OrderItemInput[]; window: string; dropAddress: string; paymentMethodId: string; pickupAddress?: string }) =>
    apiFetch<CreatedOrder>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getTracking: (orderId: string) => apiFetch<TrackingResponse>(`/orders/${orderId}/tracking`),

  getProfile: (role: Role) => apiFetch<ProfileResponse>(`/profile?role=${role}`),

  getJobs: () => apiFetch<JobsResponse>('/jobs'),
  setOnline: (online: boolean) => apiFetch<{ online: boolean }>('/courier/online', { method: 'PATCH', body: JSON.stringify({ online }) }),
  acceptJob: (id: string) => apiFetch<{ id: string }>(`/jobs/${id}/accept`, { method: 'POST' }),
  skipJob: (id: string) => apiFetch<{ id: string }>(`/jobs/${id}/skip`, { method: 'POST' }),
  refillJobs: () => apiFetch<{ list: JobsResponse['list'] }>('/jobs/refill', { method: 'POST' }),

  getActiveDelivery: () => apiFetch<{ active: ActiveDelivery | null }>('/delivery/active'),
  patchActiveDelivery: (patch: { receiver?: string; proof?: 'photo' | 'sign' }) =>
    apiFetch<{ active: ActiveDelivery }>('/delivery/active', { method: 'PATCH', body: JSON.stringify(patch) }),
  advanceDelivery: () => apiFetch<{ active: ActiveDelivery | null }>('/delivery/advance', { method: 'POST' }),

  getChat: (role: Role) => apiFetch<{ messages: ChatMessage[] }>(`/chat?role=${role}`),
  sendChat: (role: Role, text: string) =>
    apiFetch<{ messages: ChatMessage[] }>('/chat', { method: 'POST', body: JSON.stringify({ role, text }) }),
};
