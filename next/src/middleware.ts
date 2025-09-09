import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { i18n } from './i18n-config';

function getLocale(request: NextRequest): string | undefined {
  // Use cookie if it exists and is valid
  const langCookie = request.cookies.get('lang');
  if (langCookie && i18n.locales.includes(langCookie.value as 'fi' | 'en')) {
    return langCookie.value;
  }

  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Validate negotiator headers
  if (!negotiatorHeaders?.['accept-language']) {
    return 'en';
  }

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders })
    .languages()
    .filter((lang) => i18n.locales.includes(lang as 'fi' | 'en'));

  const locales: readonly string[] = i18n.locales;
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Public paths that should not be redirected
  if (
    [
      '/logo.png',
      '/telegram.svg',
      '/manifest.webmanifest',
      '/sitemap.xml',
      '/robots.txt',
      '/favicon.ico',
      '/apple-icon.png',
      '/icon1.png',
      '/icon2.png',
      '/images/news.jpg',
      '/images/collaboration.jpg',
      '/images/contact.jpg',
      '/images/events.jpg',
      '/images/new_students.jpg',
      '/images/organization.jpg',
      '/images/event_placeholder.png',
      '/banner.png',
      '/banner_mobile.png',
      '/partners_pattern.svg',
      '/robo_404.svg',
      '/robo.500.svg',
      '/binary.svg',
      '/ccchaos.svg',
      '/blob.svg',
      '/luuppi_banner_text_fi.svg',
      '/luuppi_banner_text_en.svg',
      '/kolmiot.svg',
      '/luuppi-cards.svg',
      '/luuppi.svg',
      '/locale-icons/us.svg',
      '/locale-icons/fi.svg',
    ].includes(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    const newUrl = new URL(request.url);
    newUrl.pathname = `/${locale}${pathname}`;

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!_next).*)'],
};
