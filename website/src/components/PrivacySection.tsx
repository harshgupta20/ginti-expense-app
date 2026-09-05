import Link from 'next/link';
import { Reveal } from './Reveal';
import { Icon } from './icons';
import { Aurora } from './Aurora';

const points = [
  { icon: 'wifiOff' as const, label: 'No network calls' },
  { icon: 'lock' as const, label: 'No account' },
  { icon: 'shield' as const, label: 'No trackers or ads' },
  { icon: 'download' as const, label: 'You own exports' },
];

export function PrivacySection() {
  return (
    <section id="privacy" className="relative overflow-hidden py-24 sm:py-32">
      <Aurora className="opacity-70" />
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="eyebrow">Private by architecture</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-paper sm:text-5xl">
              Your data never <span className="text-gradient">leaves your phone.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-cream/60">
              No servers to breach. No account to leak.{' '}
              <Link href="/privacy" className="font-medium text-leaf-300 underline underline-offset-4 hover:text-leaf-200">
                Read the policy
              </Link>
              .
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {points.map((p, i) => (
              <Reveal key={p.label} delay={0.12 + i * 0.05}>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm text-cream/75">
                  <Icon name={p.icon} className="h-4 w-4 text-leaf-300" />
                  {p.label}
                </span>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15} className="flex justify-center">
          <div className="relative grid h-80 w-80 place-items-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
            <div className="absolute inset-8 rounded-full border border-white/8" />
            <div className="absolute inset-0 animate-[spin_28s_linear_infinite]">
              {['No cloud', 'No account', 'No ads', 'No trackers'].map((t, i) => (
                <span
                  key={t}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-ink-900/80 px-3 py-1 text-xs text-cream/60"
                  style={{ transform: `rotate(${i * 90}deg) translateY(-9.6rem) rotate(-${i * 90}deg)` }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="grid h-32 w-32 place-items-center rounded-[2rem] bg-gradient-to-br from-leaf-500 to-leaf-800 text-white shadow-glow">
              <Icon name="lock" className="h-14 w-14" strokeWidth={1.4} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
