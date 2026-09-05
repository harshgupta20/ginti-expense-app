import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/LegalShell';
import { Icon } from '@/components/icons';
import { site, faqs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with Ginti — backups, data deletion, common questions, and how to reach us.',
  alternates: { canonical: '/support' },
};

export default function SupportPage() {
  return (
    <LegalShell
      title="Support"
      intro="Ginti is built to just work — but if you’re stuck, here’s how to get unstuck fast."
    >
      <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${site.contactEmail}`}
          className="group flex items-center gap-4 rounded-2xl border border-leaf-500/25 bg-leaf-500/10 p-5 transition-colors hover:bg-leaf-500/15"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-500 text-white">
            <Icon name="mail" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-paper">Email us</p>
            <p className="text-sm text-leaf-200">{site.contactEmail}</p>
          </div>
        </a>
        <a
          href={site.playUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-leaf-300">
            <Icon name="play" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-paper">Google Play</p>
            <p className="text-sm text-cream/55">Reviews & updates</p>
          </div>
        </a>
      </div>

      <h2>Back up &amp; restore your data</h2>
      <p>
        Your data lives only on your phone, so keeping a backup is the single most important habit. In the app, open{' '}
        <strong>Settings → Backup &amp; Export</strong>, create a full backup file, and save it somewhere safe (Drive,
        Files, or email it to yourself). To move to a new phone, install Ginti and use <strong>Import backup</strong>.
      </p>

      <h2>Delete your data</h2>
      <p>
        You’re always in control. Delete individual records inside the app, wipe everything from{' '}
        <strong>Settings → Clear All Data</strong>, or simply uninstall the app to remove all associated data from your
        device.
      </p>

      <h2>Export for your accountant</h2>
      <p>
        Need a statement? Export a CSV or a formatted report for any month or year from{' '}
        <strong>Settings → Export report</strong>, then share it via any app.
      </p>

      <h2>Common questions</h2>
      <ul>
        {faqs.slice(0, 4).map((f) => (
          <li key={f.q}>
            <strong>{f.q}</strong> {f.a}
          </li>
        ))}
      </ul>
      <p>
        See the <Link href="/#faq">full FAQ</Link> for more, or read our <Link href="/privacy">Privacy Policy</Link> and{' '}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalShell>
  );
}
