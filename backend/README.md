# Deeliva backend (placeholder)

A small Express + TypeScript API that serves the Deeliva app real HTTP
responses shaped like the eventual production API, backed by Netlify DB
(Postgres) so state survives across deploys and cold starts. It exists so the
app isn't built against a mock inside the app itself — swap `API_BASE_URL` in
`app/src/api/config.ts` for the real Deeliva API's URL and this whole
directory becomes unnecessary, **as long as the real API's responses match
the shapes below** (or `app/src/api/client.ts` is updated to match the real
API instead).

It's deployed as a Netlify Function (`netlify/functions/api.js` wraps the
Express app with `serverless-http`) rather than a long-running server, since
that's what Netlify hosts. `src/app.ts` holds the actual Express app (used
both by the function and by plain `node`/`tsx` locally); `src/server.ts` is
just a thin `app.listen()` wrapper for the latter.

## Running

The app needs a real Postgres connection (via `@netlify/database`), which
only exists once this is linked to its Netlify site, so local dev goes
through the Netlify CLI rather than plain `tsx`:

```bash
npm install
npx netlify link --id 8bc100bb-b754-4e91-b2a7-483221d58ced   # one-time, needs `netlify login` first
npx netlify dev      # emulates the Function + provisions/connects the dev DB branch, http://localhost:8888
```

`npm run dev` (`tsx --watch src/server.ts`) still works for quick local
iteration on anything that *doesn't* touch the database, but every route that
reads or writes `db` will throw without a database connection string in the
environment — `npx netlify dev:exec -- npm run dev` runs it with the linked
site's env vars injected if you want the plain-Express path with a real DB.

`npm run typecheck` runs `tsc --noEmit`. There's no test suite — the routes
were smoke-tested by hand against every endpoint during development (against
the original file-based store; re-verify after the first real deploy).

## Deploying

The Netlify site (`deeliva-backend`, id `8bc100bb-b754-4e91-b2a7-483221d58ced`)
already exists but has never had a successful deploy — the deploy attempted
from this project's dev session was rejected outright by Netlify's API, which
looks like an environment-specific restriction rather than anything wrong
with the code. From a normal machine:

```bash
npm install -g netlify-cli   # if you don't have it
netlify login
netlify link --id 8bc100bb-b754-4e91-b2a7-483221d58ced
netlify deploy --prod
```

That provisions the Postgres database (via the `@netlify/database` /
`netlify/database/migrations/` setup) and publishes the function on first
deploy — no manual database setup needed.

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
