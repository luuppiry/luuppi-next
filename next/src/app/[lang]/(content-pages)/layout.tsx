interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20 max-md:py-12">
      {children}
    </section>
  );
}
