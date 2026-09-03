import { Platform } from 'react-native';

/**
 * Base URL for the placeholder Deeliva backend (see /backend).
 *
 * The backend now runs as a Netlify Function against Netlify DB, not a
 * plain `node`/`tsx` process — run it locally with `npx netlify dev` (see
 * backend/README.md), which defaults to port 8888, not 4000.
 *
 * When the real Deeliva API is ready — or once the backend is actually
 * deployed to Netlify (see backend/README.md's "Deploying" section, which
 * is currently blocked from this dev environment) — point this at it: every
 * call in this app goes through `apiFetch` in ./client.ts, so nothing else
 * needs to change unless the response shapes differ.
 *
 * - iOS simulator: http://localhost:8888 works as-is.
 * - Android emulator: localhost refers to the emulator itself, not your
 *   machine — use http://10.0.2.2:8888 instead.
 * - Physical device (Expo Go): use your computer's LAN IP, e.g.
 *   http://192.168.1.23:8888, and make sure the phone is on the same network.
 */
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8888/api/v1',
  default: 'http://localhost:8888/api/v1',
});
