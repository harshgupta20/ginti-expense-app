import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Icon, type IconName } from './icons';
import { features } from '@/lib/content';

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Everything you need"
          title={
            <>
              Powerful where it counts.
              <br className="hidden sm:block" /> Simple everywhere else.
            </>
          }
          subtitle="Ginti does the heavy lifting — budgets, analytics, subscriptions, reminders — without ever asking for an account or a connection."
        />

        <div className="mt-16 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 3) * 0.06}
              className={f.span === 'wide' ? 'sm:col-span-2' : ''}
            >
              <article
                className={`group relative h-full overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
                  f.accent
                    ? 'border-leaf-500/25 bg-gradient-to-br from-leaf-500/[0.14] to-leaf-700/[0.05]'
                    : 'border-white/8 bg-white/[0.03] hover:border-leaf-400/30'
                } hover:-translate-y-1 hover:shadow-card`}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-leaf-400/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-2xl bg-leaf-500/15 text-leaf-300 ring-1 ring-inset ring-leaf-400/20">
                  <Icon name={f.icon as IconName} className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-paper">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
