'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Aurora } from './Aurora';
import { PlayBadge } from './PlayBadge';
import { PhoneFrame, PhoneHome, PhoneAnalytics } from './PhoneMockup';
import { Icon } from './icons';
import { site } from '@/lib/content';

const trust = [
  { icon: 'lock' as const, label: '100% Private' },
  { icon: 'wifiOff' as const, label: 'Works Offline' },
  { icon: 'check' as const, label: 'No Account' },
];

export function Hero() {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      <Aurora />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-60" />

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div>
          <motion.span
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-leaf-400" />
            {site.nameDevanagari} · to count
          </motion.span>

          <motion.h1
            className="mt-6 text-balance text-5xl font-bold leading-[1.02] tracking-tight text-paper sm:text-6xl lg:text-7xl"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
          >
            A better way to <span className="text-gradient">track your money.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed text-cream/65"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
          >
            {site.description}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.19, ease }}
          >
            <PlayBadge />
            <a href="#features" className="btn-ghost">
              See what’s inside
              <Icon name="arrowRight" className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            className="mt-6 flex items-center gap-2 text-sm text-cream/55"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.28 }}
          >
            <span className="rounded-full bg-leaf-500/12 px-3 py-1 font-semibold text-leaf-200">{site.price}</span>
            {site.priceNote}
          </motion.div>

          <motion.ul
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.34 }}
          >
            {trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-sm text-cream/70">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf-500/15 text-leaf-300">
                  <Icon name={t.icon} className="h-3.5 w-3.5" />
                </span>
                {t.label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Devices */}
        <div className="relative mx-auto flex h-[520px] w-full max-w-md items-center justify-center">
          <motion.div
            className="absolute right-2 top-6 hidden scale-[0.82] opacity-90 sm:block"
            initial={reduce ? false : { opacity: 0, x: 40, rotate: 8 }}
            animate={{ opacity: 0.92, x: 0, rotate: 8 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
          >
            <PhoneFrame className="rotate-[8deg]">
              <PhoneAnalytics />
            </PhoneFrame>
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={reduce ? false : { opacity: 0, y: 40, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
          >
            <div className={reduce ? '' : 'animate-float'}>
              <PhoneFrame className="rotate-[-3deg] shadow-glow">
                <PhoneHome />
              </PhoneFrame>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
