'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { Aurora } from './Aurora';
import { PlayBadge } from './PlayBadge';
import { GitHubButton } from './GitHubButton';
import { PhoneFrame, PhoneHome } from './PhoneMockup';
import { Icon } from './icons';
import { site } from '@/lib/content';

const chips = ['Free forever', 'Open source', 'Works offline', 'No account'];

export function Hero() {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  const areaRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !areaRef.current) return;
    const r = areaRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <Aurora />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-60" />

      <div className="container-x grid min-h-[100svh] items-center gap-12 pt-28 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div>
          <motion.span
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-leaf-400" />
            {site.nameDevanagari} · free &amp; open source
          </motion.span>

          <motion.h1
            className="mt-6 text-balance text-6xl font-bold leading-[0.98] tracking-tight text-paper sm:text-7xl lg:text-8xl"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease }}
          >
            Count what <span className="text-gradient">matters.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-lg text-cream/60"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease }}
          >
            A private, offline expense tracker. {site.subtitle}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
          >
            <PlayBadge />
            <GitHubButton />
          </motion.div>

          <motion.ul
            className="mt-8 flex flex-wrap gap-2"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.32 }}
          >
            {chips.map((c) => (
              <li
                key={c}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-cream/70"
              >
                {c}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Device with pointer-driven 3D tilt */}
        <div
          ref={areaRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="relative flex justify-center"
          style={{ perspective: 1200 }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            initial={reduce ? false : { opacity: 0, y: 40, rotateZ: -4 }}
            animate={{ opacity: 1, y: 0, rotateZ: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="relative"
          >
            <div className={reduce ? '' : 'animate-float'}>
              <PhoneFrame className="shadow-glow">
                <PhoneHome />
              </PhoneFrame>
            </div>

            {/* Floating depth chips */}
            <div
              className="glass absolute -left-6 top-16 hidden rounded-2xl px-4 py-3 sm:block"
              style={{ transform: 'translateZ(60px)' }}
            >
              <p className="text-[10px] text-cream/50">This month</p>
              <p className="text-sm font-bold text-leaf-300">↓ 12%</p>
            </div>
            <div
              className="glass absolute -right-6 bottom-24 hidden rounded-2xl px-4 py-3 sm:block"
              style={{ transform: 'translateZ(80px)' }}
            >
              <p className="text-[10px] text-cream/50">Saved</p>
              <p className="text-sm font-bold text-paper">₹25,150</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/40"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Icon name="scrollCue" className={`h-6 w-6 ${reduce ? '' : 'animate-bounce'}`} />
      </motion.div>
    </section>
  );
}
