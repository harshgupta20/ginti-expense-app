import Link from 'next/link';
import { Reveal } from './Reveal';
import { Icon } from './icons';
import { Aurora } from './Aurora';

const points = [
  { icon: 'wifiOff' as const, title: 'Zero network calls', body: 'The app never talks to a server — because there isn’t one.' },
  { icon: 'lock' as const, title: 'No account, ever', body: 'Nothing to sign up for, nothing to leak. You are anonymous by design.' },
  { icon: 'shield' as const, title: 'No trackers or ads', body: 'No analytics SDKs, no advertising, no data brokers. None.' },
  { icon: 'download' as const, title: 'You own the export', body: 'Backups leave your phone only when you tap Export, to a place you choose.' },
];

export function PrivacySection() {
  return (
    <section id="privacy" className="relative overflow-hidden py-24 sm:py-32">
      <Aurora className="opacity-70" />
      <div className="container-x">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="eyebrow">Privacy first, always</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-paper sm:text-5xl">
                Your data never <span className="text-gradient">leaves your phone.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/65">
                Most finance apps are a funnel for your data. Ginti is the opposite: a self-contained vault that runs
                entirely on-device. Read it in plain English —
                <Link href="/privacy" className="ml-1 font-medium text-leaf-300 underline underline-offset-4 hover:text-leaf-200">
                  our privacy policy
                </Link>
                .
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {points.map((p, i) => (
                <Reveal key={p.title} delay={0.12 + i * 0.06}>
                  <div className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-500/15 text-leaf-300">
                      <Icon name={p.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-paper">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-cream/55">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Visual */}
          <Reveal delay={0.15} className="flex justify-center">
            <div className="relative grid h-80 w-80 place-items-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
              <div className="absolute inset-8 rounded-full border border-white/8" />
              <div className="absolute inset-0 animate-[spin_28s_linear_infinite]">
                {['No cloud', 'No account', 'No ads', 'No trackers'].map((t, i) => (
                  <span
                    key={t}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-ink-900/80 px-3 py-1 text-xs text-cream/60"
                    style={{
                      transform: `rotate(${i * 90}deg) translateY(-9.6rem) rotate(-${i * 90}deg)`,
                    }}
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
      </div>
    </section>
  );
}
