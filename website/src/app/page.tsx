import { Hero } from '@/components/Hero';
import { Stats } from '@/components/Stats';
import { Features } from '@/components/Features';
import { Showcase } from '@/components/Showcase';
import { Steps } from '@/components/Steps';
import { PrivacySection } from '@/components/PrivacySection';
import { Pricing } from '@/components/Pricing';
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
  offers: { '@type': 'Offer', price: '0.99', priceCurrency: 'USD' },
  url: site.url,
  downloadUrl: site.playUrl,
  publisher: { '@type': 'Organization', name: site.company },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Stats />
      <Features />
      <Showcase />
      <Steps />
      <PrivacySection />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
