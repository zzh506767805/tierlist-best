'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { localeNames, locales, defaultLocale, type Locale } from '../i18n';
import { useState } from 'react';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [langOpen, setLangOpen] = useState(false);

  const prefix = locale === defaultLocale ? '' : `/${locale}`;

  return (
    <header className="border-b border-white/10 bg-[#0f1117]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`${prefix}/`} className="font-bold text-lg tracking-tight">
          <span className="text-blue-400">Tier</span>ListMaker
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href={`${prefix}/tool`}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium"
          >
            {t('tool')}
          </Link>

          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="px-2 py-1 rounded text-gray-400 hover:text-white transition-colors text-xs"
            >
              {localeNames[locale as Locale] || 'EN'}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a1b23] border border-white/10 rounded-lg shadow-xl py-1 min-w-[120px]">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={loc === defaultLocale ? '/' : `/${loc}`}
                    className={`block px-3 py-1.5 text-sm hover:bg-white/5 ${
                      loc === locale ? 'text-blue-400' : 'text-gray-300'
                    }`}
                    onClick={() => setLangOpen(false)}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
