import Link from 'next/link';
import { Icon } from './icons';
import type { ReactNode } from 'react';

export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated?: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-leaf-600/15 blur-[120px]" aria-hidden />
      <div className="container-x max-w-3xl pb-24 pt-32 sm:pt-40">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cream/50 transition-colors hover:text-leaf-200">
          <Icon name="arrowRight" className="h-4 w-4 rotate-180" />
          Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-paper sm:text-5xl">{title}</h1>
        {updated && <p className="mt-3 text-sm text-cream/45">Effective date: {updated}</p>}
        {intro && <p className="mt-6 text-lg leading-relaxed text-cream/65">{intro}</p>}
        <div className="prose-legal mt-8">{children}</div>
      </div>
    </div>
  );
}
