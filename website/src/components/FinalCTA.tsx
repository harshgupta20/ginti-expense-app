import Image from 'next/image';
import { Reveal } from './Reveal';
import { PlayBadge } from './PlayBadge';
import { Aurora } from './Aurora';
import { site } from '@/lib/content';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-leaf-500/25 bg-gradient-to-br from-ink-800 to-ink-950 px-6 py-16 text-center sm:px-16">
            <Aurora className="opacity-80" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-40" aria-hidden />

            <Image
              src="/brand/icon.png"
              alt="Ginti app icon"
              width={96}
              height={96}
              className="mx-auto h-20 w-20 rounded-3xl shadow-glow"
            />
            <h2 className="mx-auto mt-8 max-w-2xl text-balance text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              Because your money is <span className="text-gradient">personal.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-cream/65">
              Start counting today. {site.price}, once — and it’s yours for good.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PlayBadge />
              <span className="text-sm text-cream/50">{site.priceNote}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
