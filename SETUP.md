# Ginti — Setup Guide 

Ginti (गिनती, "to count") is a **local-first, offline** expense tracker built with Expo / React
Native. All data lives in an on-device SQLite database — no accounts, no servers, no analytics.

## Prerequisites
- Node.js 20+
- `npm install -g eas-cli`
- An Expo account (for EAS cloud builds)
- Android SDK + JDK 17 only if you want to build locally

## 1. Install
```bash
npm install
```

## 2. Brand assets (already generated)
App icon, adaptive icon, splash, notification icon and Play store graphics are derived from two
source images in `assets/brand/` — `icon-source.png` (the wallet + leaf icon artwork) and
`banner.png` (the marketing banner). Regenerate any time with:
```bash
pip install Pillow                       # one-time
python3 scripts/generate-assets.py
```
Outputs: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`,
`assets/notification-icon.png`, and `assets/play/` (512 icon + 1024×500 feature graphic).
To change the brand, replace the two images in `assets/brand/` and rerun the script.

## 3. Run in development
Ginti has no custom native modules, so the easiest path is a dev/preview build:
```bash
eas build -p android --profile preview     # installable APK
# then:
npm run start
```
Local build (needs Android SDK):
```bash
npm run prebuild
npm run android
```

## 4. Build for release / Play Store
See [`PLAY_STORE.md`](PLAY_STORE.md) for the full submission checklist.
```bash
eas build -p android --profile production        # AAB for Play
eas build -p android --profile production-apk    # sideloadable APK
```

---

## How it works

Ginti is **manual entry**: you log expenses yourself (the earlier notification-capture native
module has been removed). On top of that it provides budgets, subscriptions, analytics, reminders,
and backup/export.

### Notifications (local, no server)
`src/services/notifications.ts` schedules on-device reminders — a daily spend recap plus a couple of
GenZ "log your spend" nudges (default 9am / 2pm / 10pm). They're re-queued on every app open by
`src/hooks/useReminders.ts`, which also runs the subscription processor and budget alerts.

### Subscriptions
`src/services/subscriptions.ts` auto-generates a transaction each month for active subscriptions
(yearly bills are amortised ÷12). It's idempotent and runs on app open.

### Data export / backup
- Full backup: `src/services/backupService.ts` (JSON export/import for phone migration).
- Reports: `src/services/reportExport.ts` (CSV or HTML table for a month/year).

---

## Key files
| File | Purpose |
|------|---------|
| `app/(tabs)/` | Dashboard, History, Calendar, Analytics, Budgets, Configure |
| `app/add-transaction.tsx` | Manual entry (incl. "make it a subscription") |
| `app/configure/` | Categories, payment sources, people, subscriptions, export-report |
| `src/db/database.ts` | All SQLite queries + migrations + backup export/import |
| `src/db/schema.ts` | Table definitions + default seeds |
| `src/stores/` | Zustand stores (transactions, budgets, config, subscriptions, settings) |
| `src/services/notifications.ts` | Local reminder scheduling |
| `src/services/subscriptions.ts` | Recurring-charge processor |
| `src/components/ui/LoadingSpinner.tsx` | Money-counting loader |
| `scripts/generate-assets.py` | Derives icon/splash/Play graphics from `assets/brand/` |

> Zustand gotcha: store selectors must return **stable references** (don't `.map`/`.filter` inside a
> selector) or screens re-render infinitely and freeze. Derive in render instead.

## Useful commands
```bash
npx tsc --noEmit     # type-check (≈9 env-only errors from expo typed-routes are expected)
python3 scripts/generate-assets.py   # regenerate brand assets from assets/brand/
```
