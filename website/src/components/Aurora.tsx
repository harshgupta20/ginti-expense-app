/** Ambient animated glow blobs used behind hero / CTA sections. Pure CSS. */
export function Aurora({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute -left-24 top-[-10%] h-[42rem] w-[42rem] rounded-full bg-leaf-600/25 blur-[130px] animate-aurora-slow" />
      <div
        className="absolute right-[-10%] top-[10%] h-[36rem] w-[36rem] rounded-full bg-leaf-400/20 blur-[120px] animate-aurora-slow"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="absolute bottom-[-20%] left-1/3 h-[34rem] w-[34rem] rounded-full bg-emerald-700/20 blur-[140px] animate-aurora-slow"
        style={{ animationDelay: '-14s' }}
      />
    </div>
  );
}
