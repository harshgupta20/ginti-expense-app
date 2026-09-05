import type { Metadata } from 'next';
import { LegalShell } from '@/components/LegalShell';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the Ginti app.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated={site.effectiveDate}
      intro={`These terms govern your use of Ginti, a mobile application published by ${site.company}. By downloading or using Ginti, you agree to them.`}
    >
      <h2>1. The app</h2>
      <p>
        Ginti is an offline, on-device expense tracker. It stores your data locally on your phone and does not require an
        account or an internet connection to function. It is provided as a finished product, not a service.
      </p>

      <h2>2. Your licence</h2>
      <p>
        Ginti is free and open-source software from {site.company}. You may install and use it on any device you own or
        control. Your rights to the source code — including copying, modifying, and redistributing it — are governed by
        the open-source licence published in the project’s{' '}
        <a href={site.github} target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>
        , which controls in the event of any conflict with these terms.
      </p>

      <h2>3. Price</h2>
      <p>
        Ginti is <strong>free</strong>. There are no purchases, subscriptions, in-app purchases, or ads. It is
        distributed through Google Play and as a direct download (APK) from {site.domain}. Where you install via Google
        Play, Google’s terms also apply.
      </p>

      <h2>4. Your data and backups</h2>
      <p>
        Your data lives only on your device. <strong>You are responsible for keeping your own backups.</strong> Use the
        in-app export/backup feature regularly, especially before changing or resetting your phone. Because we never
        receive your data, we cannot recover it for you if it is lost, and we are not liable for any such loss. See our{' '}
        <a href="/privacy">Privacy Policy</a> for details.
      </p>

      <h2>5. Acceptable use</h2>
      <p>
        Ginti is a general-purpose finance utility. It does not provide financial, tax, investment, or accounting advice.
        Figures and reports are only as accurate as the data you enter; you are responsible for verifying anything you
        rely on.
      </p>

      <h2>6. Warranty disclaimer</h2>
      <p>
        The app is provided <strong>“as is” and “as available,”</strong> without warranties of any kind, whether express
        or implied, including merchantability, fitness for a particular purpose, and non-infringement, to the maximum
        extent permitted by law.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {site.company} shall not be liable for any indirect, incidental, special,
        or consequential damages, or for any loss of data or profits, arising out of your use of (or inability to use)
        the app. Where liability cannot be excluded, it is limited to the amount you paid for the app.
      </p>

      <h2>8. Updates and changes</h2>
      <p>
        We may release updates that add, change, or remove features. We may also update these terms; the current version
        will always be published at this URL with a new effective date. Continued use after a change means you accept the
        updated terms.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of India, without regard to conflict-of-law principles. Nothing here limits
        any rights you have as a consumer that cannot be waived under applicable law.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </LegalShell>
  );
}
