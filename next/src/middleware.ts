import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { i18n } from './i18n-config';

import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // ! Do not use ÄÖÅ. These are actually converted to %C3%84%C3%96%C3%85
  if (
    [
      '/manifest.webmanifest',
      '/sitemap.xml',
      '/robots.txt',
      '/favicon.ico',
      '/apple-icon.png',
      '/icon1.png',
      '/icon2.png',
    ].includes(pathname)
  ) {
    return NextResponse.next();
  }

  /**
   * Next.js handles locally imported assets as immutable assets. However, if
   * we use svg files those are not handled by Next.js. Following code handles
   * caching, which is not ideal, but improves speed by caching the svgs as well.
   *
   * There might (and probably is) cache busting issues with this approach. If you
   * decide to change any of the assets below, you should also change the filename
   * to avoid caching issues.
   *
   * TODO: Find a better way to handle caching
   */
  if (
    [
      '/partners_pattern.svg',
      '/robo.svg',
      '/binary.svg',
      '/ccchaos.svg',
      '/blob.svg',
      '/luuppi_banner_text_fi.svg',
      '/luuppi_banner_text_en.svg',
      '/kolmiot.svg',
      '/luuppi-cards.svg',
      '/luuppi.svg',
      '/banner.png',
      '/banner_mobile.png',
      '/locale-icons/us.svg',
      '/locale-icons/fi.svg',
      '/images/news.jpg',
      '/images/collaboration.jpg',
      '/images/contact.jpg',
      '/images/events.jpg',
      '/images/new_students.jpg',
      '/images/organization.jpg',
      '/images/event_placeholder.png',
    ].includes(pathname)
  ) {
    const response = NextResponse.next();
    response.headers.set(
      'cache-control',
      'public, max-age=31536000, immutable',
    );
    return response;
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!_next).*)'],
};
