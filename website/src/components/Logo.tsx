import Link from 'next/link';
import { LeafMark } from './icons';
import { site } from '@/lib/content';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label={`${site.name} home`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-white shadow-glow-sm transition-transform duration-300 group-hover:scale-105">
        <LeafMark className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-paper">{site.name}</span>
    </Link>
  );
}
