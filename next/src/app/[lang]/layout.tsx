import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import NotificationBar from '@/components/NotificationBar/NotificationBar';
import { getDictionary } from '@/dictionaries';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import EventSelectorProvider from '@/providers/EventSelectorProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { APIResponse } from '@/types/types';
import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import PlausibleProvider from 'next-plausible';
import { Poppins } from 'next/font/google';
import { i18n } from '../../i18n-config';
import './globals.css';

const titilliumFont = Poppins({
  subsets: ['latin'],
  weight: ['200', '300', '400', '600', '700', '900'],
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function RootLayout(props: RootLayoutProps) {
  const params = await props.params;

  const { children } = props;

  const dictionary = await getDictionary(params.lang);

  const notification = await getStrapiData<
    APIResponse<'api::notification.notification'>
  >(params.lang, '/api/notification', ['notification'], true);

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
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
                } catch (_) {
                  document.documentElement.setAttribute('data-theme', 'light');
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
            <Header dictionary={dictionary} lang={params.lang} />
            <EventSelectorProvider>
              <div className="flex-1">{children}</div>
            </EventSelectorProvider>
            <Footer dictionary={dictionary} lang={params.lang} />
            <NotificationBar lang={params.lang} notification={notification} />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ lang: SupportedLanguage }>;
}): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  return {
    title: dictionary.seo.title,
    description: dictionary.seo.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL as string),
    alternates: {
      canonical: `/${params.lang}`,
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
