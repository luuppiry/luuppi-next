export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20">{children}</section>
  );
}
