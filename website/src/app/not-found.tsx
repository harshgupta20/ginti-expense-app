import Link from 'next/link';
import { Icon } from '@/components/icons';
import { LeafMark } from '@/components/icons';

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-leaf-600/20 blur-[130px]" aria-hidden />
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-white shadow-glow">
          <LeafMark className="h-8 w-8" />
        </span>
        <p className="mt-8 text-7xl font-bold tracking-tight text-paper">404</p>
        <h1 className="mt-3 text-xl font-semibold text-paper">This page didn’t count.</h1>
        <p className="mx-auto mt-3 max-w-sm text-cream/55">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Back to home
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
