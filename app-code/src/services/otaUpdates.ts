import * as Updates from 'expo-updates';

const LOG_TAG = '[OTA]';

// Defensive cap for slow/hung networks. The check is never awaited by the UI,
// but we still bound each network call so a staged promise can't linger forever.
const UPDATE_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Checks for an OTA update in the background. If one exists, it is downloaded
 * silently and staged for the NEXT cold launch — the running app is never
 * reloaded and the user is never interrupted.
 *
 * This function never throws and never blocks startup: on ANY failure
 * (offline, slow network, server unavailable, timeout, unexpected error) the
 * app simply keeps running the currently installed version.
 */
export async function checkForUpdatesInBackground(): Promise<void> {
  // Updates are disabled in dev, Expo Go, and any build compiled without
  // expo-updates — calling the API there would throw, so bail out early.
  if (__DEV__ || !Updates.isEnabled) {
    console.log(`${LOG_TAG} skipped (dev build or updates disabled)`);
    return;
  }

  try {
    console.log(`${LOG_TAG} checking for update…`);
    const check = await withTimeout(
      Updates.checkForUpdateAsync(),
      UPDATE_TIMEOUT_MS,
      'checkForUpdate'
    );

    if (!check.isAvailable) {
      console.log(`${LOG_TAG} no update available`);
      return;
    }

    console.log(`${LOG_TAG} update available — downloading…`);
    const fetched = await withTimeout(
      Updates.fetchUpdateAsync(),
      UPDATE_TIMEOUT_MS,
      'fetchUpdate'
    );

    if (fetched.isNew) {
      // Staged successfully. expo-updates launches it automatically on the next
      // cold start. We intentionally do NOT call Updates.reloadAsync(), so the
      // user is never interrupted mid-session.
      console.log(`${LOG_TAG} update downloaded — ready for next launch`);
    } else {
      console.log(`${LOG_TAG} download finished — nothing new to apply`);
    }
  } catch (error) {
    // Offline / timeout / server unavailable / unexpected — swallow it and keep
    // running the current version. No user-facing error, no crash.
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${LOG_TAG} update check failed (keeping current version): ${message}`);
  }
}
