// Single source of truth for site content. Update copy / links here.

export const site = {
  name: 'Ginti',
  nameDevanagari: 'गिनती',
  company: 'First Anchor',
  domain: 'firstanchor.cloud',
  url: 'https://firstanchor.cloud',
  tagline: 'A better way to track your money.',
  subtitle: 'Simple. Private. Yours.',
  description:
    'Ginti is a beautifully simple, private expense tracker that lives entirely on your phone. No accounts, no cloud, no ads — just you and your money.',
  packageId: 'cloud.firstanchor.ginti',
  playUrl: 'https://play.google.com/store/apps/details?id=cloud.firstanchor.ginti',
  contactEmail: 'hgupta427700@gmail.com',
  price: 'Under $1',
  priceNote: 'One-time. No subscriptions.',
  effectiveDate: '28 June 2026',
};

export const nav = [
  { label: 'Features', href: '/#features' },
  { label: 'Privacy', href: '/#privacy' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export const stats = [
  { value: 0, suffix: '', label: 'Servers your data touches' },
  { value: 0, suffix: '', label: 'Trackers or ad SDKs' },
  { value: 100, suffix: '%', label: 'On-device & offline' },
  { value: 1, prefix: '<$', label: 'One-time price' },
];

export type Feature = {
  title: string;
  body: string;
  icon: string; // key for the inline icon set
  span?: 'wide' | 'tall' | 'normal';
  accent?: boolean;
};

export const features: Feature[] = [
  {
    title: '100% offline & private',
    body: 'Everything lives in a private database on your phone. No accounts, no cloud, no network calls — your money is nobody else’s business.',
    icon: 'shield',
    span: 'wide',
    accent: true,
  },
  {
    title: 'Add an expense in seconds',
    body: 'Amount, note, category, payment source and who paid — logged before the thought leaves your head.',
    icon: 'bolt',
  },
  {
    title: 'Analytics that actually help',
    body: 'A clean dashboard, calendar view and category breakdowns so you always know where your money goes.',
    icon: 'chart',
  },
  {
    title: 'Budgets that make sense',
    body: 'Overall and per-category limits that carry forward month to month, with a friendly heads-up before you overspend.',
    icon: 'target',
  },
  {
    title: 'Subscriptions on autopilot',
    body: 'Add a recurring charge once. Ginti logs it every month and splits yearly bills evenly across twelve.',
    icon: 'repeat',
  },
  {
    title: 'Gentle reminders',
    body: 'A nightly recap of what you spent today, plus a couple of fun nudges. Never spammy.',
    icon: 'bell',
  },
  {
    title: 'Export & migrate easily',
    body: 'CSV or a formatted report for any month or year, plus one-file backup and restore to a new phone.',
    icon: 'download',
  },
  {
    title: 'Truly yours',
    body: 'Customise categories, payment methods and people. Everything is editable — nothing locked behind a subscription.',
    icon: 'sparkle',
  },
];

export const steps = [
  {
    n: '01',
    title: 'Install & open',
    body: 'No sign-up, no email, no onboarding maze. Pick your currency and you’re counting.',
  },
  {
    n: '02',
    title: 'Log as you spend',
    body: 'Tap +, enter an amount, done. Categories, people and payment sources are one tap away.',
  },
  {
    n: '03',
    title: 'See the whole picture',
    body: 'Budgets, analytics and a nightly recap turn scattered spends into real clarity.',
  },
];

export const faqs = [
  {
    q: 'Is my financial data safe?',
    a: 'Completely. Ginti stores everything in a private database on your device and makes zero network calls. There are no servers to breach, no account to hack, and no analytics or ad SDKs bundled in.',
  },
  {
    q: 'Do I need an account or internet?',
    a: 'Neither. Ginti works fully offline. You never create an account or log in — open the app and start tracking.',
  },
  {
    q: 'How much does Ginti cost?',
    a: 'A single one-time purchase of under a dollar on Google Play. No subscriptions, no in-app purchases, no ads. Buy it once, keep it forever.',
  },
  {
    q: 'Can I move my data to a new phone?',
    a: 'Yes. Export a full backup to a single file and restore it on any device. You can also export CSV or a formatted report for any month or year — great for an accountant.',
  },
  {
    q: 'What happens to my data if I uninstall?',
    a: 'Because everything is stored locally, uninstalling removes all your data from the device. You can also wipe it anytime from Settings → Clear All Data.',
  },
  {
    q: 'Which permissions does Ginti use?',
    a: 'Only notifications (for your daily recap and reminders) and vibrate (for haptics). No location, contacts, camera, microphone, SMS, or storage snooping.',
  },
];
