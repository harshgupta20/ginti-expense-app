'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Icon, type IconName } from './icons';
import { features } from '@/lib/content';

export function Features() {
  const reduce = useReducedMotion();

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Everything, nothing extra
          </motion.span>
          <motion.h2
            className="mt-5 text-4xl font-bold tracking-tight text-paper sm:text-5xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Built for the way you actually spend.
          </motion.h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: 1200 }}>
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              className={`group relative overflow-hidden rounded-3xl border p-6 ${
                f.accent
                  ? 'border-leaf-500/25 bg-gradient-to-br from-leaf-500/[0.15] to-leaf-700/[0.05]'
                  : 'border-white/8 bg-white/[0.03]'
              } ${f.span === 'wide' ? 'sm:col-span-2' : ''} transition-colors duration-300 hover:border-leaf-400/40`}
              initial={reduce ? false : { opacity: 0, y: 60, rotateX: -28, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? undefined : { y: -6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-leaf-400/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />
              <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-2xl bg-leaf-500/15 text-leaf-300 ring-1 ring-inset ring-leaf-400/20">
                <Icon name={f.icon as IconName} className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-paper">{f.title}</h3>
              <p className="mt-1.5 text-sm text-cream/55">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
