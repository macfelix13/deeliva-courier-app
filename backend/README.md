# Deeliva backend (placeholder)

A small Express + TypeScript API that serves the Deeliva app real HTTP
responses shaped like the eventual production API, backed by an in-memory
store (persisted to `data.json` so state survives restarts). It exists so the
app isn't built against a mock inside the app itself — swap `API_BASE_URL` in
`app/src/api/config.ts` for the real Deeliva API's URL and this whole
directory becomes unnecessary, **as long as the real API's responses match
the shapes below** (or `app/src/api/client.ts` is updated to match the real
API instead).

## Running

```bash
npm install
npm run dev      # tsx --watch, http://localhost:4000
```

`npm run typecheck` runs `tsc --noEmit`. There's no test suite — the routes
were smoke-tested by hand against every endpoint during development.

## Swapping in the real API

Everything the app does goes through `app/src/api/client.ts`. To point at the
real Deeliva API:

1. Change `API_BASE_URL` in `app/src/api/config.ts`.
2. Add auth (a bearer token, cookie, whatever the real API needs) to the
   `apiFetch` helper in `client.ts` — there's a single call site.
3. Reconcile response shapes: either make the real API return what's listed
   below, or adjust the `api.*` functions in `client.ts` and the types in
   `app/src/api/types.ts` to match the real API instead. Nothing else in the
   app should need to change, since screens only ever call `api.*`.

## Endpoints

All under `/api/v1`. No auth — there's one demo customer (Nadia Whitcombe)
and one demo courier (Ray Okafor); `activeRole` in the store tracks which
one the app is currently acting as (set via `PATCH /session`).

| Method | Path | Purpose |
|---|---|---|
| GET | `/session` | current role + user |
| PATCH | `/session` | switch role (`{ role: 'customer' \| 'courier' }`) |
| GET | `/onboarding` | draft onboarding state + address suggestions |
| PATCH | `/onboarding` | update phone/pickup/notes draft |
| POST | `/onboarding/complete` | finalize default address, returns nearby-courier stats |
| GET | `/services` | service tiers (same day / express / next morning) |
| GET | `/payment-methods` | saved payment methods |
| POST | `/quote` | price a parcel: `{ serviceId, weightKg, cover }` |
| GET | `/home` | greeting, active shipment summary, saved routes |
| GET | `/orders?q=&filters=` | search/filter order history |
| GET | `/orders/:id` | one order, full detail |
| POST | `/orders` | book a shipment (checkout) |
| GET | `/orders/:id/tracking` | live tracking state (see below) |
| GET | `/profile?role=` | profile stats + settings rows |
| GET | `/jobs` | open job queue + courier stats (courier role) |
| PATCH | `/courier/online` | toggle online/offline |
| POST | `/jobs/:id/accept` | accept a job → becomes the active delivery |
| POST | `/jobs/:id/skip` | drop a job from the queue |
| POST | `/jobs/refill` | repopulate the queue |
| GET | `/delivery/active` | the courier's current delivery step |
| PATCH | `/delivery/active` | set proof type / receiver name |
| POST | `/delivery/advance` | move to the next delivery step |
| GET | `/chat?role=` | message thread for that role |
| POST | `/chat` | send a message (gets a canned reply appended) |

### Tracking simulation

There's no real courier GPS feed here, so `computeTrackState` in
`src/lib/tracking.ts` derives a stage + ETA purely from how long ago the
order was booked (`bookedAt`), ticking down every ~2.6 simulated seconds —
the same cadence the original prototype used. It's a pure function of wall
time, so polling `GET /orders/:id/tracking` needs no background timer. Rip
this out once the real API returns real courier positions.
