import Image from 'next/image';

export default function Hero() {
	return (
		<section>
			<div className="bg-blue-200  relative h-80 max-md:h-60 transition-all duration-300">
				<div className="z-10 absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#7b7fb5]/30">
					<div className="flex flex-col items-center text-white gap-4">
						<div>
							<Image
								src="/luuppi.svg"
								width={200}
								height={200}
								alt="logo"
								className="max-md:w-40"
							/>
						</div>
						<p className="text-2xl font-semibold max-w-2xl text-center max-md:text-xl transition-all duration-300 px-4">
							Luuppi ry is the subject association for students of
							mathematics, statistical data analysis and computer
							science at Tampere University.
						</p>
					</div>
				</div>
				<div className="relative flex w-full h-full overflow-hidden">
					<Image
						src="/pikkujoulu.png"
						layout="fill"
						objectFit="cover"
						alt="pikkujoulu"
						className="filter brightness-90 scale-110 blur-sm grayscale-[70%]"
					/>
				</div>
			</div>
		</section>
	);
}
