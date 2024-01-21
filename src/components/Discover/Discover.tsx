import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';

const links = [
  {
    name: 'Organization',
    href: '/organization',
    image: '/temp/organization.jpg',
  },
  {
    name: 'Events',
    href: '/events',
    image: '/temp/events.jpg',
  },
  {
    name: 'New Students',
    href: '/new-students',
    image: '/temp/new_students.jpg',
  },
  {
    name: 'Blog',
    href: '/blog',
    image: '/temp/blog.jpg',
  },
  {
    name: 'Collaboration',
    href: '/collaboration',
    image: '/temp/collaboration.jpg',
  },
  {
    name: 'Contact',
    href: '/contact',
    image: '/temp/contact.jpg',
  },
];

export default function Discover() {
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-20">
      <h2 className="mb-8 text-5xl font-bold max-md:text-4xl">
        Discover Luuppi
      </h2>
      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2">
        {links.map((link) => (
          <Link
            href={link.href}
            className="group relative flex aspect-[3/2] h-full w-full border-4 border-primary-950 shadow-[7px_7px_#000] transition-all duration-300 hover:shadow-[0px_0px_#000] max-md:aspect-square"
            key={link.name}
          >
            <div className="absolute z-20 h-full w-0 bg-primary-400/50 transition-all duration-300 group-hover:w-full"></div>
            <div className="absolute bottom-5 left-5 z-30 flex items-center justify-center bg-white text-2xl transition-all duration-300 max-md:bottom-0 max-md:left-0 max-md:w-full max-md:text-xl">
              <h2 className="flex items-center px-4 py-2 font-bold">
                {link.name}
                <span>
                  <MdOutlineKeyboardArrowRight size={25} />
                </span>
              </h2>
            </div>
            <div className="relative flex h-full w-full overflow-hidden">
              <div className="absolute z-10 flex h-full w-full bg-gradient-to-t from-background-400/70 via-transparent to-transparent"></div>
              <Image
                draggable={false}
                src={link.image}
                fill
                alt="haalarit"
                className="object-cover brightness-90 transition-all duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
