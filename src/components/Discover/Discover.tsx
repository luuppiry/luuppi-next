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
		<section className="max-w-screen-xl mx-auto py-20 px-4">
			<h1 className="text-5xl font-bold mb-8 max-md:text-4xl">
				Discover Luuppi
			</h1>
			<div className="grid grid-cols-3 max-lg:grid-cols-2 gap-6">
				{links.map((link) => (
					<Link
						href={link.href}
						className="group relative w-full h-full flex aspect-[3/2] border-4 border-primary-950 shadow-[7px_7px_#000] hover:shadow-[0px_0px_#000] transition-all duration-300 max-md:aspect-square"
						key={link.name}
					>
						<div className="absolute w-0 h-full bg-primary-400/50 z-20 group-hover:w-full transition-all duration-300"></div>
						<div className="absolute bottom-5 left-5 z-30 bg-white flex items-center justify-center max-md:left-0 max-md:bottom-0 max-md:w-full text-2xl max-md:text-xl transition-all duration-300">
							<h2 className="font-bold px-4 py-2 flex items-center">
								{link.name}
								<span>
									<MdOutlineKeyboardArrowRight size={25} />
								</span>
							</h2>
						</div>
						<div className="relative flex w-full h-full overflow-hidden">
							<div className="w-full h-full flex absolute z-10 bg-gradient-to-t via-transparent from-background-400/70 to-transparent"></div>
							<Image
								src={link.image}
								layout="fill"
								objectFit="cover"
								alt="haalarit"
								className="group-hover:scale-105 transition-all duration-300 brightness-90"
							/>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
