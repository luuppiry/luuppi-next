export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10">{children}</section>
  );
}
