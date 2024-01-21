import Image from 'next/image';
import Link from 'next/link';

export default function BlogPreview() {
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-20">
      <p className="mb-2 text-2xl font-bold">Find out what&apos;s going on</p>
      <h2 className="mb-8 text-5xl font-bold max-md:text-4xl">
        Our Latest Posts
      </h2>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {Array.from({ length: 3 }, (_, i) => (
            <Link
              href="/blog"
              className="group relative flex aspect-[3/2] flex-col border-4 border-primary-950 shadow-[7px_7px_#000] transition-all duration-300 hover:shadow-[0px_0px_#000] max-md:aspect-[4/2]"
              key={i}
            >
              <div className="relative flex h-full w-full overflow-hidden">
                <Image
                  draggable={false}
                  className="object-cover transition-all duration-300 group-hover:scale-105"
                  src={i % 2 === 0 ? '/temp/blog.jpg' : '/temp/pullapäivä.jpg'}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt="event"
                  fill
                />
              </div>
              <div className="absolute z-20 h-full w-0 bg-primary-400/50 transition-all duration-300 group-hover:w-full" />
              <div className="z-30 flex w-full flex-col border-t-2 border-dashed border-primary-300 bg-primary-400 p-4">
                <p>
                  <span className="font-bold text-white">31 Aug 2024</span>
                </p>
                <h3>
                  <span className="text-xl font-bold text-white">
                    Blog post title
                  </span>
                </h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/blog"
            className="rounded-lg bg-primary-400 px-4 py-2 text-2xl font-bold text-white transition-all duration-300 max-md:text-xl"
          >
            See all posts
          </Link>
        </div>
      </div>
    </section>
  );
}
