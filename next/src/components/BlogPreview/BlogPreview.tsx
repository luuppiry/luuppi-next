import Image from 'next/image';
import Link from 'next/link';

export default function BlogPreview() {
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-20">
      <p className="mb-1 text-2xl font-bold">Find out what&apos;s going on</p>
      <h2 className="mb-8 text-5xl font-extrabold max-md:text-4xl">
        Our Latest Posts
      </h2>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <article
              key={i}
              className={`${i === 0 ? 'col-span-3 max-lg:col-span-1 max-lg:flex-col' : 'col-span-1 flex-col'} flex gap-4 rounded-lg border-[1px] border-gray-200/50 shadow-sm`}
            >
              <div
                className={`${i !== 0 ? 'rounded-t-lg' : 'rounded-l-lg max-lg:rounded-l-none max-lg:rounded-t-lg'} relative aspect-video w-full bg-gradient-to-r from-primary-400 to-primary-300
                `}
              >
                <Image
                  src="/images/blog.jpg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fill
                  alt="yes"
                  className={`${i !== 0 ? 'rounded-t-lg' : 'rounded-l-lg max-lg:rounded-l-none max-lg:rounded-t-lg'} object-cover`}
                />
              </div>
              <div className="flex w-full flex-col justify-between gap-12 p-4">
                <div className="flex flex-col gap-1">
                  <span className="font-bold uppercase text-accent-400">
                    news
                  </span>
                  <Link
                    href="/blog"
                    className={`inline-block text-2xl font-bold ${i === 0 ? 'text-4xl max-lg:text-2xl' : ''} hover:underline`}
                  >
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </Link>
                  <p className="line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Voluptate, voluptatem. Lorem ipsum dolor sit amet
                    consectetur adipisicing elit. Saepe delectus molestiae quas
                    a architecto, eaque placeat natus voluptatibus, amet
                    veritatis culpa inventore autem enim labore consequuntur
                    reprehenderit sint cum fuga obcaecati repudiandae deleniti
                    sunt aperiam debitis iure. Non, temporibus architecto.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Image
                    src="/images/pullapaiva.jpg"
                    width={50}
                    height={50}
                    alt="avatar"
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold">Matti Meikäpoika</span>
                    <span className="text-sm opacity-60">22.01.2024</span>
                  </div>
                </div>
              </div>
            </article>
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