import { TrackStep } from '../types';

/** Same shape as the prototype's TRACK array — four fixed milestones. */
export const TRACK_STEPS: TrackStep[] = [
  { stage: 0, label: 'Booked', note: 'Payment authorised' },
  { stage: 1, label: 'Collected', note: 'Courier scanned your parcel' },
  { stage: 2, label: 'On the way', note: 'Direct route, no depot' },
  { stage: 3, label: 'Delivered', note: 'Photo proof on arrival' },
];

const TICK_SECONDS = 2.6;

export function statusToInitialStage(status: string): number {
  switch (status) {
    case 'booked':
      return 0;
    case 'collected':
      return 1;
    case 'on_the_way':
      return 2;
    default:
      return 3;
  }
}

/**
 * Deterministic re-implementation of the prototype's setInterval simulation:
 * every ~2.6s the ETA counts down by one minute, and once it reaches 4 the
 * order flips to "delivered". Computed from elapsed time so polling GETs
 * need no background timer.
 */
export function computeTrackState(bookedAt: number, etaBaseMinutes: number, initialStage: number) {
  const elapsedSeconds = Math.max(0, (Date.now() - bookedAt) / 1000);
  const ticks = Math.floor(elapsedSeconds / TICK_SECONDS);
  const eta = Math.max(1, etaBaseMinutes - ticks);
  const stage = eta <= 4 ? 3 : initialStage;
  return { stage, eta: stage >= 3 ? 0 : eta };
}
