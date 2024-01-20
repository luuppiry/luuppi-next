import Image from 'next/image';
import Link from 'next/link';
import { IoLocation } from 'react-icons/io5';

export default function EventsPreview() {
	return (
		<section className=" bg-[#b2b5d7]">
			<div className="max-w-screen-xl mx-auto py-20 px-4">
				<p className="text-2xl font-bold mb-2">
					Check out what&apos;s happening
				</p>
				<h1 className="text-5xl font-bold mb-8 max-md:text-4xl">
					Upcoming events
				</h1>
				<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
					{Array.from({ length: 4 }, (_, i) => (
						<Link
							href="/events"
							className=" rounded-xl relative max-md:aspect-square group"
							key={i}
						>
							<div className="h-full absolute flex-col justify-end flex w-full bg-gradient-to-t from-black via-transparent to-transparent z-20 transition-all duration-300 p-6">
								<p className="text-white font-bold">
									31 Aug 2024
								</p>
								<p className="text-red-400 text-xl font-bold max-md:text-xl group-hover:underline transition-all duration-300">
									Event name
								</p>
								<div className="flex items-center gap-1">
									<IoLocation size={16} color="#fff" />
									<p className="text-white font-bold">
										Koskikeskus
									</p>
								</div>
							</div>
							<div className="relative flex w-full h-full overflow-hidden aspect-[5/6] max-md:aspect-square grayscale-[80%]">
								<Image
									className="group-hover:scale-105 transition-all duration-300"
									src="/temp/events.jpg"
									alt="event"
									layout="fill"
									objectFit="cover"
								/>
							</div>
						</Link>
					))}
				</div>
				<div className="flex justify-center mt-8">
					<Link
						href="/events"
						className="bg-white text-black font-bold text-2xl px-4 py-2 rounded-lg max-md:text-xl transition-all duration-300"
					>
						See all events
					</Link>
				</div>
			</div>
		</section>
	);
}
