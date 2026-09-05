import Link from 'next/link';
import { Reveal } from './Reveal';
import { PlayBadge } from './PlayBadge';
import { Icon } from './icons';

const points = [
  { big: '₹0', small: 'Forever. No trial, no tiers.' },
  { big: '0', small: 'Ads, trackers or upsells.' },
  { big: '0', small: 'Accounts or sign-ups.' },
];

export function FreeSection() {
  return (
    <section id="free" className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-x text-center">
        <Reveal>
          <span className="eyebrow">No catch</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 text-5xl font-bold tracking-tight text-paper sm:text-7xl">
            Free. <span className="text-gradient">For everyone.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-lg text-lg text-cream/60">
            No price. No ads. No account. We build open-source public goods — this one’s on us.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p.small} delay={i * 0.08}>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8">
                <p className="text-5xl font-bold tracking-tight text-gradient">{p.big}</p>
                <p className="mt-3 text-sm text-cream/55">{p.small}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PlayBadge />
            <Link href="/apk" className="btn-ghost">
              <Icon name="download" className="h-5 w-5" />
              Download APK
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
