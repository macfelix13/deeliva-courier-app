import { Order, OrderStatus } from '../types';
import { SERVICES } from '../store';

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'booked':
    case 'on_the_way':
      return 'In transit';
    case 'collected':
      return 'Collected';
    case 'delivered':
      return 'Delivered';
    case 'refunded':
      return 'Refunded';
  }
}

export function serviceName(serviceId: string): string {
  return SERVICES.find((s) => s.id === serviceId)?.name ?? 'Express 2 hr';
}

/** Short label matching the search screen's filter chip vocabulary. */
export function serviceSpeedLabel(serviceId: string): string {
  switch (serviceId) {
    case 'sameday':
      return 'Same day';
    case 'next':
      return 'Next day';
    case 'express':
    default:
      return 'Express';
  }
}

export function orderTotal(order: Order): number {
  return Math.round(order.items.reduce((sum, i) => sum + i.price, 0) * 100) / 100;
}

export function matchesSearch(order: Order, q: string, filters: string[]): boolean {
  const query = q.trim().toLowerCase();
  const haystack = `${order.title} ${order.pickupAddress} ${order.dropAddress} ${order.ref}`.toLowerCase();
  const okQuery = !query || haystack.includes(query);

  const speedFilters = filters.filter((f) => ['Express', 'Same day', 'Next day'].includes(f));
  const stateFilters = filters.filter((f) => ['In transit', 'Delivered', 'Collected', 'Refunded'].includes(f));

  const orderSpeeds = order.items.map((i) => serviceSpeedLabel(i.serviceId));
  const okSpeed = !speedFilters.length || speedFilters.some((f) => orderSpeeds.includes(f));
  const okState = !stateFilters.length || stateFilters.includes(orderStatusLabel(order.status));

  return okQuery && okSpeed && okState;
}
