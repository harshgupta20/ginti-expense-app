import { Hero } from '@/components/Hero';
import { Stats } from '@/components/Stats';
import { ScrollStory } from '@/components/ScrollStory';
import { Features } from '@/components/Features';
import { PrivacySection } from '@/components/PrivacySection';
import { OpenSource } from '@/components/OpenSource';
import { FreeSection } from '@/components/FreeSection';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';
import { site } from '@/lib/content';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: site.name,
  operatingSystem: 'Android',
  applicationCategory: 'FinanceApplication',
  description: site.description,
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: site.url,
  downloadUrl: site.playUrl,
  sameAs: [site.github],
  publisher: { '@type': 'Organization', name: site.company },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Stats />
      <ScrollStory />
      <Features />
      <PrivacySection />
      <OpenSource />
      <FreeSection />
      <FAQ />
      <FinalCTA />
    </>
  );
}
