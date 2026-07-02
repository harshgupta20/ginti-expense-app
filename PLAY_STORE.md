# Ginti — Google Play Store Submission Guide

Everything you need to publish Ginti. Items marked **🔴 action** must be done in the Play Console
or require a decision from you; **✅ done** is already handled in this repo.

---

## 0. ⚠️ Critical: target API level (do this first)
Google Play requires **new apps to target Android 15 (API level 35)**. This project is on **Expo SDK
52**, which targets **API 34** — a Play upload will be **rejected** until the target is raised.

**Recommended fix — upgrade the Expo SDK (handles API 35 + edge-to-edge correctly):**
```bash
npx expo install expo@^53 --fix
npx expo-doctor
```
Then smoke-test every screen (edge-to-edge changes how status/nav bars overlay content).

**Quick alternative (if you can't upgrade now):** add `expo-build-properties` and set the target,
then test for content sliding under the system bars:
```bash
npx expo install expo-build-properties
```
```jsonc
// app.json → expo.plugins
["expo-build-properties", { "android": { "compileSdkVersion": 35, "targetSdkVersion": 35 } }]
```
Upgrading the SDK is the cleaner, supported path. Don't ship until the target is 35.

---

## 1. App identity ✅
| Field | Value |
|---|---|
| App name | **Ginti** |
| Package / Application ID | `com.trackerexpo.app` |
| Version name | `1.0.0` |
| Version code | `1` (EAS auto-increments on each production build) |
| Category | **Finance** |
| Default language | English (US) |

> The application ID can't change after first upload. `com.trackerexpo.app` is fine to keep.

## 2. Build a Play-ready AAB ✅ (config) / 🔴 (run it)
Play requires an **Android App Bundle (.aab)** — already set as the `production` profile.
```bash
npm install -g eas-cli
eas login
eas build -p android --profile production      # produces the .aab
```
Let EAS generate & manage the **upload keystore** (Play App Signing). Keep your EAS account secure.

For a sideloadable APK instead, use `eas build -p android --profile production-apk`.

## 3. Privacy policy 🔴
Play requires a **publicly hosted** privacy policy URL.
- Source text: [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) (no data collected — local-only).
- Host it somewhere public (GitHub Pages, Google Sites, Notion public page, your domain) and paste
  the URL into **Play Console → Policy → App content → Privacy policy**.

## 4. Data Safety form 🔴 (answers below)
Because Ginti is fully on-device with no network calls:
- **Does your app collect or share any user data?** → **No.**
- **Is all data encrypted in transit?** → N/A (no data leaves the device).
- **Do you provide a way to request data deletion?** → **Yes** — in-app *Settings → Clear All Data*,
  or uninstall. (Data is local; no server deletion needed.)
- Data types collected/shared: **none**.

> The exported backup/report files are created only when the user taps Export and are shared via the
> user's own share sheet — the app itself transmits nothing. This does not count as "collection."

## 5. Permissions justification ✅ / 🔴 (if prompted)
Declared permissions are minimal:
- `POST_NOTIFICATIONS` — local daily spend recap + reminder nudges.
- `VIBRATE` — haptics for notifications.
- Exact-alarm and storage permissions are **blocked** in `app.json` so no sensitive-permission
  declaration form is triggered. (Reminders use inexact scheduling, which is fine for daily nudges.)

No Permissions Declaration Form should be required. If Play flags anything, it'll be because a
library re-added a permission — check the **merged manifest** (see §10).

## 6. Content rating 🔴
Complete the **IARC questionnaire** in Console. Expected result: **Everyone**.
- No violence, sexual content, profanity, gambling, or user-generated content.
- Contains no ads. Does not share location.

## 7. Store listing copy ✅ (copy/paste)
**App name (30 chars max):** `Ginti — Expense Tracker`

**Short description (80 chars max):**
`Count every rupee. A private, offline expense tracker with budgets & reminders.`

**Full description (≤4000 chars):**
```
Ginti (गिनती — "to count") is a beautifully simple, private expense tracker that lives entirely on
your phone. No accounts, no cloud, no ads — just you and your money.

WHY GINTI
• 100% offline & private — your data never leaves your device.
• Add an expense in seconds: amount, note, category, payment source and who paid.
• A clean dashboard, calendar view and analytics so you always know where your money goes.

BUDGETS THAT MAKE SENSE
• Set an overall budget and per-category limits.
• Budgets carry forward month to month — tweak any month without redoing everything.
• Friendly heads-up as you approach a limit.

SUBSCRIPTIONS ON AUTOPILOT
• Add recurring monthly or yearly charges once.
• Ginti auto-logs them each month (yearly bills are split evenly across 12 months).

GENTLE REMINDERS
• A nightly recap of what you spent today.
• A couple of fun nudges to keep your log up to date — never spammy.

SHARE & MIGRATE EASILY
• Export a CSV or formatted report for any month or year — perfect for an accountant.
• Full backup & restore: move all your data to a new phone with one file.

FULLY YOURS
• Customise categories, payment methods and people (track who paid).
• Everything is editable; nothing is locked behind a subscription.

Download Ginti and start counting — one rupee at a time.
```

## 8. Graphics 🔴 (upload) — generated assets ✅
| Asset | Requirement | File |
|---|---|---|
| Hi-res icon | 512×512 PNG | `assets/play/play-icon-512.png` ✅ |
| Feature graphic | 1024×500 PNG/JPG | `assets/play/feature-graphic-1024x500.png` ✅ |
| Phone screenshots | 2–8, ≥320px, 16:9 or 9:16 | 🔴 capture on device (see below) |

The feature graphic is brand-only; you can overlay the "Ginti" wordmark in Canva if you want text.

**Screenshots (🔴):** capture 4–6 on a phone/emulator — Dashboard, Add expense, Calendar,
Analytics, Budgets, Subscriptions. Quick way:
```bash
# with an emulator/device running the app:
adb exec-out screencap -p > shot1.png
```

## 9. Submit ✅ (config) / 🔴 (run)
First release should go to **Internal testing**, then promote to Production.
```bash
# after a production build finishes:
eas submit -p android --profile production --latest
```
`eas.json` is set to submit to the **internal** track as a **draft**. You'll need a Google Play
**service account JSON** (Console → Setup → API access) the first time, or submit the AAB manually
via Console → Internal testing → Create release.

## 10. Pre-launch checklist
- [ ] Target API 35 (§0) — **blocker**
- [ ] Production AAB built (`eas build … --profile production`)
- [ ] Privacy policy hosted + URL added
- [ ] Data Safety form completed (No data collected)
- [ ] Content rating questionnaire done
- [ ] Store listing copy + icon + feature graphic + screenshots uploaded
- [ ] Tested a release build on a physical device (notifications, backup/restore, export)
- [ ] (Optional) Verify the merged manifest has only the expected permissions:
      `npx expo prebuild -p android` then check `android/app/src/main/AndroidManifest.xml`

---
*Generated for Ginti. Update version/versionCode in `app.json` (EAS auto-increments on production builds).*
