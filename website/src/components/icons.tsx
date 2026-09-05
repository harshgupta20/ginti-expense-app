import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
});

/** The Ginti sprout mark. */
export function LeafMark(p: P) {
  return (
    <svg {...base(p)} strokeWidth={0} fill="currentColor">
      <path d="M12 21c0-5.5-2.2-8.9-6.3-10.2C3.4 10 2 8.2 2 5.6 5.9 5 9 6.1 10.6 8.7c.7 1.2 1.1 2.7 1.2 4.4.6-3.2 2.9-5.6 6.9-6.3 2 3.2.6 6.6-2.7 8-2 .8-3.4 2.3-4 4.4Z" />
    </svg>
  );
}

const paths: Record<string, React.ReactNode> = {
  shield: <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Zm-2.5 8.5 1.8 1.8 3.4-3.6" />,
  bolt: <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V8M17 20v-9" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 3l3 3-3 3" />
      <path d="M20 6H8a4 4 0 0 0-4 4v1" />
      <path d="M7 21l-3-3 3-3" />
      <path d="M4 18h12a4 4 0 0 0 4-4v-1" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 21h14" />
    </>
  ),
  sparkle: <path d="M12 3c.6 4.3 1.7 5.4 6 6-4.3.6-5.4 1.7-6 6-.6-4.3-1.7-5.4-6-6 4.3-.6 5.4-1.7 6-6Z" />,
  wifiOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M8.5 8.6A11 11 0 0 0 5 11M12 5c3 0 5.8 1.1 7.9 3M9 12.3c.9-.6 1.9-1 3-1.2M6.5 15.7A6.9 6.9 0 0 1 8 14.6" />
      <path d="M12 19h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2.2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 7" />,
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  wallet: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z" />
      <path d="M20 10h-4a2 2 0 0 0 0 4h4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  play: <path d="M6 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name, ...p }: { name: IconName } & P) {
  return <svg {...base(p)}>{paths[name]}</svg>;
}
