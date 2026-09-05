// Single source of truth for site content. Update copy / links here.

export const site = {
  name: 'Ginti',
  nameDevanagari: 'गिनती',
  company: 'First Anchor',
  domain: 'firstanchor.cloud',
  url: 'https://firstanchor.cloud',
  tagline: 'A better way to track your money.',
  subtitle: 'Free. Private. Open.',
  description: 'A private, offline expense tracker. Free, open source, and entirely yours.',
  packageId: 'cloud.firstanchor.ginti',
  playUrl: 'https://play.google.com/store/apps/details?id=cloud.firstanchor.ginti',
  github: 'https://github.com/harshgupta20/ginti-expense-app',
  repo: 'harshgupta20/ginti-expense-app',
  contactEmail: 'hgupta427700@gmail.com',
  effectiveDate: '28 June 2026',
};

export const apk = {
  file: '/ginti-expense-app.apk',
  version: '1.0.0',
  size: '82 MB',
  minAndroid: 'Android 7.0 and up',
};

export const nav = [
  { label: 'Features', href: '/#features' },
  { label: 'Privacy', href: '/#privacy' },
  { label: 'Open source', href: '/#open' },
  { label: 'FAQ', href: '/#faq' },
];

export type Stat = { value: number; label: string; prefix?: string; suffix?: string };

export const stats: Stat[] = [
  { value: 0, label: 'Ads & trackers' },
  { value: 0, label: 'Accounts to create' },
  { value: 0, prefix: '₹', label: 'Free, forever' },
  { value: 100, suffix: '%', label: 'Open & offline' },
];

// Chapters for the pinned, scroll-driven product demo.
export const chapters = [
  { key: 'home', kicker: 'Home', title: 'Your month, at a glance.', body: 'Balance, income and spending — the second you open.' },
  { key: 'analytics', kicker: 'Analytics', title: 'Know where it goes.', body: 'A clean breakdown of every category.' },
  { key: 'budgets', kicker: 'Budgets', title: 'Stay ahead.', body: 'Gentle warnings before you overspend.' },
];

export type Feature = { title: string; body: string; icon: string; span?: 'wide'; accent?: boolean };

export const features: Feature[] = [
  { title: 'Private by default', body: 'Everything stays on your phone.', icon: 'shield', span: 'wide', accent: true },
  { title: 'Log in seconds', body: 'Amount, category, done.', icon: 'bolt' },
  { title: 'Clear analytics', body: 'See where it all goes.', icon: 'chart' },
  { title: 'Smart budgets', body: 'Warns before you overspend.', icon: 'target' },
  { title: 'Subscriptions', body: 'Auto-logged every month.', icon: 'repeat' },
  { title: 'Gentle reminders', body: 'A nightly recap. Never spammy.', icon: 'bell' },
  { title: 'Backup & export', body: 'CSV, reports, one-file restore.', icon: 'download' },
];

export const faqs = [
  { q: 'Is it really free?', a: 'Completely. No ads, no in-app purchases, no catch — and open source.' },
  { q: 'Is my data safe?', a: 'It never leaves your phone. No servers, no accounts, no trackers.' },
  { q: 'Do I need internet or an account?', a: 'Neither. Ginti works fully offline, with no sign-up.' },
  { q: 'Can I move to a new phone?', a: 'Yes — a one-file backup and restore, plus CSV export.' },
  { q: 'Where’s the source code?', a: 'On GitHub. First Anchor builds open-source public goods.' },
];
