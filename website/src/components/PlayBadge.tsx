import { site } from '@/lib/content';

/** Self-contained "Get it on Google Play" button (no external image dependency). */
export function PlayBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href={site.playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-ink-900 shadow-glow transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
      aria-label="Get Ginti on Google Play"
    >
      <svg viewBox="0 0 512 512" className="h-7 w-7 shrink-0" aria-hidden>
        <path fill="#00D3FF" d="M47 24c-6 3-10 9-10 18v428c0 9 4 15 10 18l1 1 240-240v-6L48 23l-1 1Z" />
        <path fill="#00F076" d="M368 336 288 256v-6l80-80 1 1 95 54c27 15 27 41 0 56l-95 54-1 1Z" />
        <path fill="#FF3A44" d="m369 335-81-79L47 497c9 9 24 10 40 1l282-163Z" />
        <path fill="#FFC800" d="M369 177 87 14C71 5 56 6 47 15l241 241 81-79Z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[10px] uppercase tracking-wide text-ink-600">Get it on</span>
        <span className="text-lg font-bold">Google Play</span>
      </span>
    </a>
  );
}
