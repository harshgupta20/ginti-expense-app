# Ginti — Website

Marketing site + legal pages for **Ginti**, built with **Next.js (App Router)** and **Tailwind CSS**,
statically exported for **Firebase Hosting**.

Live pages:
- `/` — landing page (hero, features, showcase, privacy, pricing, FAQ)
- `/privacy` — **Privacy Policy** (the URL to paste into Google Play Console)
- `/terms` — Terms of Service
- `/support` — Support / contact

## Develop

```bash
cd website
npm install
npm run dev          # http://localhost:3000
```

## Build (static export)

```bash
npm run build        # outputs static site to ./out
npm run serve        # preview the exported ./out locally
```

`next.config.mjs` sets `output: 'export'`, so `npm run build` produces a fully static site in `out/`.

## Deploy to Firebase Hosting

1. Install the CLI and log in:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Set your Firebase project id in [`.firebaserc`](.firebaserc) (replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID`),
   or run `firebase use --add`.
3. Build + deploy:
   ```bash
   npm run deploy        # runs "next build" then "firebase deploy --only hosting"
   ```
   Or manually: `npm run build && firebase deploy --only hosting`.

Hosting config lives in [`firebase.json`](firebase.json) (serves `out/`, clean URLs, long-cache for assets).

### Custom domain (firstanchor.cloud)
In the Firebase Console → Hosting → **Add custom domain**, enter `firstanchor.cloud` (and/or
`www.firstanchor.cloud`) and follow the DNS steps. Once verified, your privacy policy will be live at
`https://firstanchor.cloud/privacy`.

## Editing content

Almost all copy, links, features, and FAQ live in [`src/lib/content.ts`](src/lib/content.ts).
Brand assets are in `public/brand/`. The app-screen mockups are hand-built React in
`src/components/PhoneMockup.tsx` (no screenshots needed).

## Notes / placeholders to confirm
- **Google Play URL** uses the real package id (`cloud.firstanchor.ginti`); it goes live once the app is published.
- **Contact email** is `hgupta427700@gmail.com` (from the app's privacy policy) — change in `content.ts` if you prefer a `@firstanchor.cloud` address.
- **Price** is shown as “Under $1 / one-time”; the exact amount is whatever you set on Google Play.
