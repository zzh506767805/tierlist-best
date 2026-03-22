import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { locales, defaultLocale } from '../../../i18n';
import TierListApp from '../../../components/TierListApp';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tool' });
  const baseUrl = 'https://tierlist.best';
  const url = locale === defaultLocale ? `${baseUrl}/tool` : `${baseUrl}/${locale}/tool`;

  return {
    title: `${t('title')} - Free Tier List Maker`,
    description: 'Create your custom tier list with our free drag-and-drop tool. Upload images, rank items, and export your tier list as a shareable image.',
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          l === defaultLocale ? `${baseUrl}/tool` : `${baseUrl}/${l}/tool`,
        ])
      ),
    },
  };
}

export default function ToolPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <TierListApp />
    </div>
  );
}
