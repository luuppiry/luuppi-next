import GalleryClient from '@/app/[lang]/(gallery)/client';
import { Suspense } from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-dvh bg-[hsl(0,0%,4%)]">
      <Suspense fallback={<div />}>
        <GalleryClient />
      </Suspense>
      <section
        className="mx-auto max-w-[1200px] bg-[hsl(0,0%,4%)] px-4 py-8 max-md:py-12"
        data-theme="dark"
      >
        {children}
      </section>
    </div>
  );
}
