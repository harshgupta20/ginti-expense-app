'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { stats } from '@/lib/content';

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{val}</span>;
}

export function Stats() {
  return (
    <section className="border-y border-white/6 bg-ink-950/60">
      <div className="container-x grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              {s.prefix ?? ''}
              <CountUp to={s.value} />
              {s.suffix ?? ''}
            </p>
            <p className="mt-2 text-sm text-cream/50">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
