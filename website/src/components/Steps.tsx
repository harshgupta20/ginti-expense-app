import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { steps } from '@/lib/content';

export function Steps() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading eyebrow="How it works" title="Counting, in three taps." />
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div
            className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-leaf-500/30 to-transparent md:block"
            aria-hidden
          />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative rounded-3xl border border-white/8 bg-white/[0.03] p-7">
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-lg font-bold text-white shadow-glow-sm">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-paper">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
