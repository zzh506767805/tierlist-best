import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '../i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tierlistmaker.pro';

  const pages = ['', 'tool'];

  const localeToUrl = (loc: string, path: string = '') => {
    const basePath = loc === defaultLocale ? baseUrl : `${baseUrl}/${loc}`;
    return path ? `${basePath}/${path}` : basePath;
  };

  const generateLanguagesMap = (path: string = ''): Record<string, string> => {
    const map: Record<string, string> = Object.fromEntries(
      locales.map((loc) => [loc, localeToUrl(loc, path)])
    );
    map['x-default'] = path ? `${baseUrl}/${path}` : baseUrl;
    return map;
  };

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  pages.forEach((page) => {
    locales.forEach((loc) => {
      entries.push({
        url: localeToUrl(loc, page),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.9,
        alternates: { languages: generateLanguagesMap(page) },
      });
    });
  });

  return entries;
}
