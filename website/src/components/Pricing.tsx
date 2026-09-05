import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { PlayBadge } from './PlayBadge';
import { Icon } from './icons';
import { site } from '@/lib/content';

const includes = [
  'Every feature — nothing gated',
  'Unlimited transactions & budgets',
  'Analytics, calendar & reports',
  'Subscriptions & reminders',
  'Backup, restore & CSV export',
  'Free updates, forever',
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Honest pricing"
          title="Less than a dollar. Once."
          subtitle="No subscriptions. No in-app purchases. No ads mining your attention. Buy Ginti once and it’s yours."
        />

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* The offer */}
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-4xl border border-leaf-500/30 bg-gradient-to-br from-leaf-500/[0.16] to-ink-800 p-8 shadow-card">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-leaf-400/20 blur-3xl" aria-hidden />
              <span className="eyebrow">One-time purchase</span>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-6xl font-bold tracking-tight text-paper">{site.price}</span>
                <span className="mb-2 text-cream/50">/ forever</span>
              </div>
              <p className="mt-2 text-sm text-cream/60">A single tap on Google Play. That’s the whole transaction.</p>

              <ul className="mt-7 space-y-3">
                {includes.map((it) => (
                  <li key={it} className="flex items-center gap-3 text-sm text-cream/80">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-500 text-white">
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <PlayBadge />
              </div>
            </div>
          </Reveal>

          {/* The comparison */}
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col justify-center rounded-4xl border border-white/8 bg-white/[0.02] p-8">
              <h3 className="text-lg font-semibold text-paper">Why one-time?</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/55">
                Subscriptions make sense when there’s a server to run. Ginti has none — so charging you every month
                wouldn’t be fair. You pay for the craft once, then it just works.
              </p>

              <div className="mt-7 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-cream/75">Typical finance app</span>
                  <span className="font-semibold text-rose-300/90 line-through decoration-rose-400/60">$4–8 / month</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-leaf-500/25 bg-leaf-500/10 p-4">
                  <span className="text-cream/90">Ginti</span>
                  <span className="font-semibold text-leaf-200">{site.price}, once</span>
                </div>
              </div>

              <p className="mt-6 text-xs text-cream/40">
                Pricing shown for illustration. Final price is set on Google Play at checkout in your local currency.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
