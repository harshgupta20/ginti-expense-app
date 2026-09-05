import { Reveal } from './Reveal';
import { GitHubButton } from './GitHubButton';
import { Icon } from './icons';
import { site } from '@/lib/content';

const facts = [
  { icon: 'code' as const, label: 'Auditable' },
  { icon: 'shield' as const, label: 'No hidden code' },
  { icon: 'sparkle' as const, label: 'Public good' },
];

export function OpenSource() {
  return (
    <section id="open" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-80 bg-leaf-600/10 blur-[130px]" aria-hidden />
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="eyebrow">Open source</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-paper sm:text-5xl">
              Built in the <span className="text-gradient">open.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-cream/60">
              Ginti is a public good from {site.company}. Read the code, trust the claims, make it yours.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-3">
              {facts.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-cream/70"
                >
                  <Icon name={f.icon} className="h-4 w-4 text-leaf-300" />
                  {f.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Repo card */}
        <Reveal delay={0.12} className="flex justify-center">
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-ink-800/60 shadow-card transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-rose-400/70" />
              <span className="h-3 w-3 rounded-full bg-amber-400/70" />
              <span className="h-3 w-3 rounded-full bg-leaf-400/70" />
              <span className="ml-3 text-xs text-cream/40">{site.domain} / source</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <Icon name="github" className="h-8 w-8 text-paper" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-paper">{site.repo}</p>
                  <p className="text-xs text-cream/45">Open-source · Android · React Native</p>
                </div>
              </div>
              <p className="mt-5 font-mono text-xs leading-relaxed text-cream/55">
                <span className="text-leaf-300">$</span> git clone
                <br />
                <span className="text-cream/70">github.com/{site.repo}</span>
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-leaf-300 group-hover:text-leaf-200">
                View on GitHub
                <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </a>
        </Reveal>
      </div>

      <div className="container-x mt-12 flex justify-center lg:hidden">
        <GitHubButton />
      </div>
    </section>
  );
}
