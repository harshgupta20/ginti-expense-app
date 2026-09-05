import type { ReactNode } from 'react';
import { LeafMark, Icon } from './icons';

/* ------------------------------------------------------------------ */
/* Phone frame                                                         */
/* ------------------------------------------------------------------ */
export function PhoneFrame({
  children,
  className = '',
  screenClass = 'bg-ink-950',
}: {
  children: ReactNode;
  className?: string;
  screenClass?: string;
}) {
  return (
    <div
      className={`relative aspect-[9/19.5] w-[280px] rounded-[2.6rem] border border-white/10 bg-[#05100b] p-2.5 shadow-card ring-1 ring-black/40 ${className}`}
    >
      <div className="absolute left-1/2 top-3 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className={`relative h-full w-full overflow-hidden rounded-[2rem] ${screenClass}`}>
        {children}
      </div>
    </div>
  );
}

function StatusBar({ title }: { title?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 text-[10px] font-medium text-white/80">
      <span>9:41</span>
      {title ? <span className="text-white/50">{title}</span> : <span />}
      <span className="flex items-center gap-1">
        <span className="tracking-tighter">●●●</span>
        <span className="ml-0.5 inline-block h-2.5 w-4 rounded-[3px] border border-white/50" />
      </span>
    </div>
  );
}

const cat = (c: string) => ({ backgroundColor: c });

/* ------------------------------------------------------------------ */
/* Home screen                                                         */
/* ------------------------------------------------------------------ */
export function PhoneHome() {
  const bars = [30, 42, 38, 55, 48, 66, 60, 78, 70, 88, 82, 96];
  const rows = [
    { icon: '🛒', name: 'Groceries', when: 'Today, 10:24 AM', amt: '−₹1,250', neg: true, c: '#F97316' },
    { icon: '🍽️', name: 'Food & Dining', when: 'Yesterday, 8:15 PM', amt: '−₹320', neg: true, c: '#EF4444' },
    { icon: '💼', name: 'Freelance', when: 'Mon, 2 Sep', amt: '+₹5,000', neg: false, c: '#22C55E' },
  ];
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-ink-900 to-ink-950">
      <StatusBar />
      <div className="flex items-center gap-2.5 px-5 pb-3 pt-4">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-white">
          <LeafMark className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Good Morning</p>
          <p className="text-[10px] text-white/45">Small steps, bigger freedom.</p>
        </div>
      </div>

      {/* This Month card */}
      <div className="mx-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-white/45">This Month</p>
            <p className="text-2xl font-bold text-white">₹24,850</p>
            <p className="mt-0.5 text-[10px] font-medium text-leaf-300">↓ 12% vs last month</p>
          </div>
          <div className="flex h-12 items-end gap-[3px]">
            {bars.map((h, i) => (
              <span
                key={i}
                className="w-[4px] rounded-full bg-gradient-to-t from-leaf-700 to-leaf-300"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-leaf-500/10 p-2.5">
            <p className="text-[9px] text-white/45">Income</p>
            <p className="text-sm font-semibold text-leaf-300">₹50,000</p>
          </div>
          <div className="rounded-xl bg-rose-500/10 p-2.5">
            <p className="text-[9px] text-white/45">Expenses</p>
            <p className="text-sm font-semibold text-rose-300">₹24,850</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <p className="text-xs font-semibold text-white">Recent Transactions</p>
        <p className="text-[10px] text-leaf-300">See all</p>
      </div>
      <div className="space-y-2 px-4">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.03] p-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full text-sm" style={cat(`${r.c}22`)}>
              {r.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-white">{r.name}</p>
              <p className="text-[9px] text-white/40">{r.when}</p>
            </div>
            <p className={`text-[11px] font-semibold ${r.neg ? 'text-rose-300' : 'text-leaf-300'}`}>{r.amt}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-end px-4 pb-5 pt-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf-500 text-white shadow-glow">
          <Icon name="wallet" className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics screen                                                    */
/* ------------------------------------------------------------------ */
export function PhoneAnalytics() {
  const legend = [
    { name: 'Food & Dining', pct: 32, c: '#F97316' },
    { name: 'Shopping', pct: 18, c: '#EC4899' },
    { name: 'Transport', pct: 12, c: '#3B82F6' },
    { name: 'Bills & Utilities', pct: 10, c: '#8B5CF6' },
    { name: 'Entertainment', pct: 8, c: '#5AC08A' },
    { name: 'Others', pct: 20, c: '#64748B' },
  ];
  const donut =
    'conic-gradient(#F97316 0 32%, #EC4899 32% 50%, #3B82F6 50% 62%, #8B5CF6 62% 72%, #5AC08A 72% 80%, #64748B 80% 100%)';
  return (
    <div className="flex h-full flex-col bg-ink-950">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <p className="text-sm font-semibold text-white">Analytics</p>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] text-white/60">This Month ▾</span>
      </div>
      <div className="grid place-items-center py-4">
        <div className="relative h-40 w-40 rounded-full" style={{ background: donut }}>
          <div className="absolute inset-[18%] grid place-items-center rounded-full bg-ink-950 text-center">
            <div>
              <p className="text-lg font-bold text-white">₹24,850</p>
              <p className="text-[9px] text-white/45">Total Expenses</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 px-5">
        {legend.map((l) => (
          <div key={l.name} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={cat(l.c)} />
            <span className="flex-1 text-[11px] text-white/75">{l.name}</span>
            <span className="text-[11px] font-semibold text-white">{l.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Budgets screen                                                      */
/* ------------------------------------------------------------------ */
export function PhoneBudgets() {
  const items = [
    { name: 'Food & Dining', used: 82, spent: '₹6,560', cap: '₹8,000', c: '#F97316' },
    { name: 'Shopping', used: 60, spent: '₹4,470', cap: '₹7,500', c: '#EC4899' },
    { name: 'Transport', used: 45, spent: '₹1,350', cap: '₹3,000', c: '#3B82F6' },
    { name: 'Entertainment', used: 96, spent: '₹1,920', cap: '₹2,000', c: '#EF4444' },
  ];
  return (
    <div className="flex h-full flex-col bg-ink-950">
      <StatusBar />
      <div className="px-5 pb-1 pt-4">
        <p className="text-sm font-semibold text-white">Budgets</p>
        <p className="text-[10px] text-white/45">September 2026</p>
      </div>
      <div className="mx-4 mt-3 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-white/50">Overall budget</p>
          <p className="text-[10px] font-medium text-leaf-300">68% used</p>
        </div>
        <p className="mt-1 text-xl font-bold text-white">
          ₹34,150 <span className="text-xs font-normal text-white/40">/ ₹50,000</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-leaf-300" style={{ width: '68%' }} />
        </div>
      </div>
      <div className="mt-4 space-y-3 px-5">
        {items.map((it) => (
          <div key={it.name}>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[11px] text-white/80">
                <span className="h-2 w-2 rounded-full" style={cat(it.c)} />
                {it.name}
              </span>
              <span className="text-[10px] text-white/45">
                {it.spent} <span className="text-white/25">/ {it.cap}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full"
                style={{ width: `${it.used}%`, backgroundColor: it.used > 90 ? '#EF4444' : it.c }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
