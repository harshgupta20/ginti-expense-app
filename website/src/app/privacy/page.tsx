import type { Metadata } from 'next';
import { LegalShell } from '@/components/LegalShell';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Ginti is a local-first, offline expense tracker. No data collection, no servers, no analytics. Read our full privacy policy.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated={site.effectiveDate}
      intro={`Ginti (package ${site.packageId}) is a local-first, offline expense tracker. All of your data stays on your device.`}
    >
      <h2>Summary</h2>
      <p>
        Ginti is a <strong>local-first, offline</strong> expense tracker. All of your data stays{' '}
        <strong>on your device</strong>. We do <strong>not</strong> collect, transmit, sell, or share any personal or
        financial information. There are no accounts, no servers, and no analytics or advertising SDKs.
      </p>

      <h2>What data the app stores (on your device only)</h2>
      <p>The app stores the information you enter, in a private local database on your phone:</p>
      <ul>
        <li>Transactions you add (amount, note/description, category, payment source, who paid, date)</li>
        <li>Categories, payment sources, people, budgets and subscriptions you configure</li>
        <li>App settings (e.g. reminder preferences)</li>
      </ul>
      <p>This data never leaves your device except when <strong>you</strong> explicitly choose to:</p>
      <ul>
        <li>
          <strong>Export a backup or report</strong> — you pick where it goes via the Android share sheet (e.g. Files,
          Drive, email). The app does not upload it anywhere on its own.
        </li>
        <li>
          <strong>Import a backup</strong> — you choose a file from your device storage.
        </li>
      </ul>

      <h2>Permissions we use</h2>
      <ul>
        <li>
          <strong>Notifications (POST_NOTIFICATIONS):</strong> to show your daily spending recap and reminder nudges.
          These are scheduled locally on your device; no data is sent anywhere.
        </li>
        <li>
          <strong>Vibrate:</strong> subtle haptic feedback for notifications.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> request location, contacts, camera, microphone, SMS, call logs, or background
        location. The app does <strong>not</strong> read your notifications or messages.
      </p>

      <h2>Data sharing</h2>
      <p>
        We do not share data with any third party. The app makes no network requests to our servers (there are none).
      </p>

      <h2>Data deletion</h2>
      <p>Because data is stored only on your device, you are in full control:</p>
      <ul>
        <li>Delete individual records inside the app, or</li>
        <li>
          Use <strong>Settings → Clear All Data</strong> to erase everything, or
        </li>
        <li>Uninstall the app to remove all associated data.</li>
      </ul>

      <h2>Children’s privacy</h2>
      <p>
        Ginti is a general-purpose finance utility and is not directed at children under 13. We do not knowingly collect
        any data from anyone.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If this policy changes, the updated version will be published at the same URL with a new effective date.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </LegalShell>
  );
}
