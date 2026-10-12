import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import { NotificationBarLoader } from '@/components/NotificationBar/NotificationBarLoader';
import { getDictionary } from '@/dictionaries';
import EventSelectorProvider from '@/providers/EventSelectorProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import PlausibleProvider from 'next-plausible';
import { Poppins } from 'next/font/google';
import { lang as language } from 'next/root-params';
import { Suspense } from 'react';
import { i18n } from '../../i18n-config';
import './globals.css';

const titilliumFont = Poppins({
  subsets: ['latin'],
  weight: ['200', '300', '400', '600', '700', '900'],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const unstable_paramMatching = { lang: 'not-found' };

export default async function RootLayout({ children }: RootLayoutProps) {
  const lang = await language();
  const dictionary = await getDictionary();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta content="light dark" name="color-scheme" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme') || 'auto';
                  let theme = 'light';
                  
                  if (savedTheme === 'auto') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } else {
                    theme = savedTheme;
                  }
                  
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
                } catch (_) {
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
        <PlausibleProvider
          customDomain={process.env.NEXT_PUBLIC_BASE_URL}
          domain={process.env.NEXT_PUBLIC_BASE_URL!?.replace('https://', '')}
          enabled={process.env.NEXT_PUBLIC_BASE_URL === 'https://luuppi.fi'}
          scriptProps={{
            src: `${process.env.NEXT_PUBLIC_BASE_URL}/js/nuuhkija.js`,

            // https://github.com/4lejandrito/next-plausible/issues/113
            // @ts-expect-error missing types
            'data-api': `${process.env.NEXT_PUBLIC_BASE_URL}/api/event`,
          }}
          selfHosted
        />
      </head>
      <body className={titilliumFont.className}>
        <SessionProvider>
          <ThemeProvider>
            <Header dictionary={dictionary} lang={lang} />
            <EventSelectorProvider>
              <div className="flex-1">{children}</div>
            </EventSelectorProvider>
            <Footer lang={lang} />
            <Suspense fallback={<div className="contents" />}>
              <NotificationBarLoader />
            </Suspense>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const dictionary = await getDictionary();

  return {
    title: dictionary.seo.title,
    description: dictionary.seo.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL as string),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: '/en',
        fi: '/fi',
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#787eba',
};
