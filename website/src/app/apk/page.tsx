import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Aurora } from '@/components/Aurora';
import { PlayBadge } from '@/components/PlayBadge';
import { Icon } from '@/components/icons';
import { apk, site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Download the Android APK',
  description: `Download the Ginti Android app (.apk) directly — version ${apk.version}, ${apk.size}.`,
  alternates: { canonical: '/apk' },
  robots: { index: false, follow: true },
};

const steps = [
  {
    title: 'Tap Download',
    body: 'Your browser saves ginti-expense-app.apk to your device. If prompted, choose “Download anyway”.',
  },
  {
    title: 'Allow the install',
    body: 'Open the file. Android may ask you to allow installs from your browser — tap Settings and enable it, then go back.',
  },
  {
    title: 'Install & open',
    body: 'Tap Install, then Open. That’s it — Ginti runs fully offline, no account needed.',
  },
];

export default function ApkPage() {
  return (
    <section className="relative overflow-hidden">
      <Aurora />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-50" aria-hidden />

      <div className="container-x flex flex-col items-center pb-24 pt-32 text-center sm:pt-40">
        <Image
          src="/brand/icon.png"
          alt="Ginti app icon"
          width={112}
          height={112}
          className="h-24 w-24 rounded-[1.6rem] shadow-glow"
          priority
        />

        <span className="eyebrow mt-8">Direct download · Android</span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-paper sm:text-5xl">
          Download <span className="text-gradient">Ginti</span> for Android
        </h1>
        <p className="mt-4 max-w-md text-cream/60">
          Get the app as an <strong className="font-semibold text-cream/80">.apk</strong> you can install directly. Works
          fully offline once installed.
        </p>

        {/* Download card */}
        <div className="mt-10 w-full max-w-md rounded-4xl border border-white/10 bg-white/[0.03] p-6 shadow-card sm:p-8">
          <a href={apk.file} download className="btn-primary w-full text-base">
            <Icon name="download" className="h-5 w-5" />
            Download APK
          </a>

          <div className="mt-5 flex items-center justify-center gap-x-5 gap-y-1 text-xs text-cream/50">
            <span>v{apk.version}</span>
            <span className="h-1 w-1 rounded-full bg-cream/25" />
            <span>{apk.size}</span>
            <span className="h-1 w-1 rounded-full bg-cream/25" />
            <span>{apk.minAndroid}</span>
          </div>

          <p className="mt-5 border-t border-white/8 pt-5 text-xs leading-relaxed text-cream/45">
            Only download from <span className="text-cream/70">{site.domain}</span>. This file is the official build from{' '}
            {site.company}.
          </p>
        </div>

        {/* How to install */}
        <div className="mt-14 w-full max-w-2xl text-left">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-cream/40">How to install</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-leaf-500/15 text-sm font-bold text-leaf-300">
                  {i + 1}
                </div>
                <h3 className="text-sm font-semibold text-paper">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-cream/55">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Play Store recommendation */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-white/8 bg-white/[0.02] px-6 py-8">
          <p className="max-w-md text-sm text-cream/60">
            Prefer automatic updates and one-tap install? Get Ginti on the Play Store instead — the APK here won’t
            update itself.
          </p>
          <PlayBadge />
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-sm text-cream/50 transition-colors hover:text-leaf-200"
        >
          <Icon name="arrowRight" className="h-4 w-4 rotate-180" />
          Back to home
        </Link>
      </div>
    </section>
  );
}
