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
      '/ccchaos.svg',
      '/questions.svg',
      '/manifest.webmanifest',
      '/favicon.ico',
      '/sitemap.xml',
      '/apple-icon.png',
      '/icon1.png',
      '/icon2.png',
      '/robots.txt',
      '/luuppi_banner_text_fi.svg',
      '/luuppi_banner_text_en.svg',
      '/kolmiot.svg',
      '/luuppi-cards.svg',
      '/luuppi.svg',
      '/banner.png',
      '/locale-icons/us.svg',
      '/locale-icons/fi.svg',
      '/images/blog.jpg',
      '/images/collaboration.jpg',
      '/images/contact.jpg',
      '/images/events.jpg',
      '/images/new_students.jpg',
      '/images/organization.jpg',
      '/images/pullapaiva.jpg',
    ].includes(pathname)
  )
    return;

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

  // Populate pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!_next).*)'],
};
