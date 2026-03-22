'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-white/10 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p>{t('tagline')}</p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} TierListMaker. {t('builtWith')} Next.js
        </p>
      </div>
    </footer>
  );
}
