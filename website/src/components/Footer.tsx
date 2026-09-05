import Link from 'next/link';
import { Logo } from './Logo';
import { Icon } from './icons';
import { site } from '@/lib/content';

const cols = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Get it on Google Play', href: site.playUrl, external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Support', href: '/support' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-ink-950">
      <div className="container-x grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-cream/55">
            {site.nameDevanagari} — “to count.” A private, offline expense tracker. Your money, your device, your rules.
          </p>
          <a
            href={`mailto:${site.contactEmail}`}
            className="mt-5 inline-flex items-center gap-2 text-sm text-leaf-300 hover:text-leaf-200"
          >
            <Icon name="mail" className="h-4 w-4" />
            {site.contactEmail}
          </a>
        </div>

        {cols.map((col) => (
          <div key={col.heading}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/40">{col.heading}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  {'external' in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cream/70 transition-colors hover:text-paper"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-cream/70 transition-colors hover:text-paper">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/6">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.company}. All rights reserved.
          </p>
          <p>Made with care. No trackers were used in the making of this app.</p>
        </div>
      </div>
    </footer>
  );
}
