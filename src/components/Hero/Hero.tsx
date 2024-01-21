import Image from 'next/image';

export default function Hero() {
	return (
		<section>
			<div className="bg-blue-200  relative h-96 max-md:h-56 transition-all duration-300 max-lg:h-80 max-sm:h-44">
				<div className="relative flex w-full h-full overflow-hidden">
					<Image
						src="/banner.png"
						layout="fill"
						objectFit="cover"
						alt="Luuppi banner"
						unoptimized
					/>
				</div>
			</div>
		</section>
	);
}
