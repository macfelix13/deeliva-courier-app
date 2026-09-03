import { Platform } from 'react-native';

/**
 * Base URL for the placeholder Deeliva backend (see /backend).
 *
 * When the real Deeliva API is ready, point this at it — every call in this
 * app goes through `apiFetch` in ./client.ts, so nothing else needs to change
 * unless the response shapes differ (see backend/README.md).
 *
 * - iOS simulator: http://localhost:4000 works as-is.
 * - Android emulator: localhost refers to the emulator itself, not your
 *   machine — use http://10.0.2.2:4000 instead.
 * - Physical device (Expo Go): use your computer's LAN IP, e.g.
 *   http://192.168.1.23:4000, and make sure the phone is on the same network.
 */
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:4000/api/v1',
  default: 'http://localhost:4000/api/v1',
});
