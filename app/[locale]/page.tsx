import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { locales, defaultLocale } from '../../i18n';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://tierlistmaker.pro';
  const url = locale === defaultLocale ? baseUrl : `${baseUrl}/${locale}`;

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, l === defaultLocale ? baseUrl : `${baseUrl}/${l}`])
      ),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url,
      siteName: 'TierListMaker',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('home');
  const meta = useTranslations('metadata');
  const hero = useTranslations('hero');

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
  ];

  const features = [
    { title: t('feature1Title'), desc: t('feature1') },
    { title: t('feature2Title'), desc: t('feature2') },
    { title: t('feature3Title'), desc: t('feature3') },
    { title: t('feature4Title'), desc: t('feature4') },
    { title: t('feature5Title'), desc: t('feature5') },
    { title: t('feature6Title'), desc: t('feature6') },
  ];

  const useCases = [
    t('useCase1'), t('useCase2'), t('useCase3'),
    t('useCase4'), t('useCase5'), t('useCase6'),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tier List Maker',
    description: meta('description'),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {hero('title')}
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {hero('subtitle')}
          </p>
          <Link
            href="tool"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-colors"
          >
            {hero('cta')} &rarr;
          </Link>
        </div>

        {/* Demo tiers preview */}
        <div className="mt-16 max-w-2xl mx-auto">
          {['S', 'A', 'B', 'C'].map((tier) => (
            <div key={tier} className="flex mb-1">
              <div
                className={`tier-${tier.toLowerCase()} w-16 h-12 flex items-center justify-center font-bold text-lg shrink-0 rounded-l`}
              >
                {tier}
              </div>
              <div className="flex-1 h-12 bg-white/5 rounded-r flex items-center px-3">
                <div className="flex gap-2">
                  {[...Array(tier === 'S' ? 2 : tier === 'A' ? 3 : tier === 'B' ? 4 : 2)].map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded bg-white/10 animate-pulse"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What is */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">{t('whatIsTitle')}</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            {t('whatIsContent')}
          </p>
        </div>
      </section>

      {/* How to use */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t('howToTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: t('howToStep1Title'), desc: t('howToStep1') },
              { num: '2', title: t('howToStep2Title'), desc: t('howToStep2') },
              { num: '3', title: t('howToStep3Title'), desc: t('howToStep3') },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t('featuresTitle')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
              >
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">{t('useCasesTitle')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((uc, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm"
              >
                {uc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {t('faqTitle')}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border border-white/10 rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer px-6 py-4 font-medium hover:bg-white/5 transition-colors flex justify-between items-center">
                  {faq.q}
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">
                    &#9662;
                  </span>
                </summary>
                <div className="px-6 pb-4 text-gray-400">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{hero('title')}</h2>
        <p className="text-gray-400 mb-8">{hero('subtitle')}</p>
        <Link
          href="tool"
          className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-colors"
        >
          {hero('cta')} &rarr;
        </Link>
      </section>
    </>
  );
}
