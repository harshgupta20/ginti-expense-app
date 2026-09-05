import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { PhoneFrame, PhoneHome, PhoneAnalytics, PhoneBudgets } from './PhoneMockup';

const screens = [
  { title: 'Home', body: 'Your month at a glance — balance, income, expenses and recent activity.', el: <PhoneHome /> },
  { title: 'Analytics', body: 'A clean donut and category breakdown reveal where it all goes.', el: <PhoneAnalytics /> },
  { title: 'Budgets', body: 'Overall and per-category limits with gentle, timely warnings.', el: <PhoneBudgets /> },
];

export function Showcase() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-96 bg-leaf-600/10 blur-[120px]" aria-hidden />
      <div className="container-x">
        <SectionHeading
          eyebrow="Designed to feel good"
          title="Numbers, made calm."
          subtitle="Thoughtful screens that turn scattered spending into a picture you actually want to look at."
        />

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {screens.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1} className="flex flex-col items-center text-center">
              <div className="transition-transform duration-500 hover:-translate-y-2">
                <PhoneFrame>{s.el}</PhoneFrame>
              </div>
              <h3 className="mt-8 text-xl font-semibold text-paper">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/55">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
