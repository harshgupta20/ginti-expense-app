'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
import { PhoneFrame, PhoneHome, PhoneAnalytics, PhoneBudgets } from './PhoneMockup';
import { chapters } from '@/lib/content';

const screens = [<PhoneHome key="h" />, <PhoneAnalytics key="a" />, <PhoneBudgets key="b" />];

function Caption({
  p,
  range,
  kicker,
  title,
  body,
}: {
  p: MotionValue<number>;
  range: [number, number, number, number];
  kicker: string;
  title: string;
  body: string;
}) {
  const [a, b, c, d] = range;
  const opacity = useTransform(p, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(p, [a, b, c, d], [40, 0, 0, -40]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <span className="eyebrow w-fit">{kicker}</span>
      <h3 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-paper sm:text-5xl">{title}</h3>
      <p className="mt-4 max-w-md text-lg text-cream/55">{body}</p>
    </motion.div>
  );
}

export function ScrollStory() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-16, 14, -6]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, -2, 4]);
  const scale = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0.86, 1, 1, 0.9]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], ['#23744A', '#2E8B5A', '#5AC08A']);

  // Per-screen crossfade windows.
  const o0 = useTransform(scrollYProgress, [0.02, 0.09, 0.3, 0.37], [0, 1, 1, 0]);
  const o1 = useTransform(scrollYProgress, [0.34, 0.42, 0.61, 0.68], [0, 1, 1, 0]);
  const o2 = useTransform(scrollYProgress, [0.66, 0.74, 0.96, 1], [0, 1, 1, 1]);
  const screenOpacity = [o0, o1, o2];

  const capRanges: [number, number, number, number][] = [
    [0.02, 0.1, 0.29, 0.35],
    [0.35, 0.43, 0.6, 0.66],
    [0.67, 0.75, 0.95, 1],
  ];

  // Progress rail fill.
  const railFill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (reduce) {
    // Static, no-scroll fallback: three phones with captions.
    return (
      <section className="py-24">
        <div className="container-x grid gap-12 sm:grid-cols-3">
          {chapters.map((c, i) => (
            <div key={c.key} className="flex flex-col items-center text-center">
              <PhoneFrame>{screens[i]}</PhoneFrame>
              <span className="eyebrow mt-8">{c.kicker}</span>
              <h3 className="mt-4 text-xl font-semibold text-paper">{c.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-cream/55">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="story" ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-40" aria-hidden />

        <div className="container-x grid w-full items-center gap-8 lg:grid-cols-2">
          {/* Captions */}
          <div className="relative order-2 h-52 lg:order-1 lg:h-64">
            {chapters.map((c, i) => (
              <Caption key={c.key} p={scrollYProgress} range={capRanges[i]} kicker={c.kicker} title={c.title} body={c.body} />
            ))}
          </div>

          {/* Phone */}
          <div className="order-1 flex justify-center lg:order-2" style={{ perspective: 1400 }}>
            <motion.div style={{ rotateY, rotateX, scale, transformStyle: 'preserve-3d' }} className="relative">
              <motion.div
                className="absolute -inset-10 -z-10 rounded-full blur-[90px]"
                style={{ backgroundColor: glow, opacity: 0.35 }}
                aria-hidden
              />
              <PhoneFrame>
                {screens.map((s, i) => (
                  <motion.div key={i} style={{ opacity: screenOpacity[i] }} className="absolute inset-0">
                    {s}
                  </motion.div>
                ))}
              </PhoneFrame>
            </motion.div>
          </div>
        </div>

        {/* Progress rail */}
        <div className="absolute bottom-10 left-1/2 h-1 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-leaf-400" style={{ width: railFill }} />
        </div>
      </div>
    </section>
  );
}
