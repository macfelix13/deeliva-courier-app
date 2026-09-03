# Deeliva Courier App

A same-day parcel courier app for Leeds: a **customer** flow (send a parcel,
track it live, see order history) and a **courier** flow (accept jobs, run
the pickup → scan → drop-off → proof-of-delivery flow), in one React Native
app with a role switch in Profile.

This repo started as a [Claude Design](https://claude.ai/design) handoff —
see `README-design-handoff.md`, `chats/`, and `project/` for the original
HTML/CSS/JS prototype and the conversation that shaped it. Everything in
`backend/` and `app/` below is the real implementation built from that
prototype.

## Structure

- `backend/` — a small Express + TypeScript API standing in for the real
  Deeliva backend, deployed as a Netlify Function backed by Netlify DB
  (Postgres), seeded with the same demo data the prototype used. See
  `backend/README.md` for the endpoint list, local dev, deploying, and how to
  swap in the real API later.
- `app/` — the Expo (React Native + TypeScript) app. Two role-based
  navigation trees (customer / courier), 11 screens, styled to match the
  prototype's "Industry" design system (Barlow / Barlow Condensed, hairline
  blueprint frames with registration-mark corners, one steel-blue accent).

## Running it

Two processes, in two terminals:

```bash
# 1. Backend — needs the Netlify CLI since it runs against a real Postgres
# database provisioned through Netlify; see backend/README.md for the
# one-time `netlify link` step and why plain `npm run dev` isn't enough here.
cd backend
npm install
npx netlify dev       # http://localhost:8888

# 2. App
cd app
npm install
npm start              # then press i (iOS simulator), a (Android), or scan the QR code in Expo Go
```

The app talks to the backend over HTTP — see `app/src/api/config.ts` for the
base URL, which needs updating to match whatever port/host the backend is
actually running on (Netlify Dev's default port, or the deployed URL once
it's live).

## Design decisions worth knowing

- **Both roles, one app.** The prototype's "Customer / Courier" panel was a
  design-tool aid; in the real app that's a "Switch to courier/customer
  account" action in Profile, which flips the whole navigation tree.
- **Variations.** The prototype exposed four layout variations as toggles
  (nav pattern, home layout, tracking style, checkout flow). This build picks
  the defaults the prototype shipped with — bottom tabs, card-list home,
  map tracking, stepped checkout — since a real app ships one of each rather
  than a live toggle.
- **Backend is a placeholder.** It's a real HTTP API with the shapes the app
  expects, not the real Deeliva service — see `backend/README.md` for how to
  point the app at the real thing when it's ready.
- **New parcel vs. order detail.** The prototype's "detail" screen doubled as
  both "create a shipment" and "view a past shipment" (it always showed the
  same mock parcel). With a real backend, past orders have their own data, so
  this build splits that into a booking screen (`NewParcel`) and a read-only
  past-order screen (`OrderDetail`).
