'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Icon } from './icons';
import { nav, site } from '@/lib/content';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-300 ${
          scrolled ? 'border-b border-white/8 bg-ink-950/70 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between">
          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-full px-4 py-2 text-sm text-cream/70 transition-colors hover:text-paper"
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href={site.playUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
              Get Ginti
            </a>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-cream md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <Icon name={open ? 'x' : 'menu'} className="h-5 w-5" />
          </button>
        </nav>
      </div>

      {open && (
        <div className="border-b border-white/8 bg-ink-950/95 backdrop-blur-xl md:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-cream/80 hover:bg-white/5"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={site.playUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-2 w-full"
              onClick={() => setOpen(false)}
            >
              Get Ginti
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
