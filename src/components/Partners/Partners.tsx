import Image from 'next/image';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';

const partners = [
	{
		image: '/partners/accountor.png',
		link: 'https://www.accountor.com/',
	},
	{
		image: '/partners/atalent.png',
		link: 'https://atalent.fi/',
	},
	{
		image: '/partners/digia.png',
		link: 'https://digia.com/',
	},
	{
		image: '/partners/exove.png',
		link: 'https://www.exove.com/',
	},
	{
		image: '/partners/futurice.png',
		link: 'https://futurice.com/',
	},
	{
		image: '/partners/gofore.png',
		link: 'https://gofore.com/',
	},
	{
		image: '/partners/innofactor.png',
		link: 'https://www.innofactor.com/',
	},
	{
		image: '/partners/insta.png',
		link: 'https://www.insta.fi/',
	},
	{
		image: '/partners/knowit.png',
		link: 'https://knowit.fi',
	},
	{
		image: '/partners/loimu.png',
		link: 'https://loimu.fi',
	},
	{
		image: '/partners/netum.png',
		link: 'https://netum.fi',
	},
	{
		image: '/partners/nitor.png',
		link: 'https://nitor.com',
	},
	{
		image: '/partners/nokia.png',
		link: 'https://nokia.com',
	},
	{
		image: '/partners/reaktor.png',
		link: 'https://reaktor.com',
	},
	{
		image: '/partners/sofiadigital.png',
		link: 'https://sofiadigital.com',
	},
	{
		image: '/partners/solita.png',
		link: 'https://solita.fi/',
	},
	{
		image: '/partners/vincit.png',
		link: 'https://vincit.com',
	},
	{
		image: '/partners/visma.png',
		link: 'https://visma.fi',
	},
];

export default function Partners() {
	return (
		<section className="max-w-screen-xl mx-auto py-20 px-4">
			<div className="flex flex-col gap-6">
				<h1 className="text-5xl font-bold max-md:text-4xl">
					Our Partners
				</h1>
				<p className="text-2xl font-semibold max-w-2xl max-md:text-xl transition-all duration-300">
					We are proud to work with these companies. If you are
					interested in collaboration don&apos;t hesitate to contact
					us!
				</p>
				<div className="flex">
					<Link
						href="/contact"
						className="bg-primary-200 text-text-950 font-bold text-2xl px-4 py-2 rounded-lg max-md:text-xl transition-all duration-300"
					>
						Read more
					</Link>
				</div>
			</div>
			<Marquee autoFill className="mt-4 max-md:mt-8">
				{partners.map((partner) => (
					<Link
						href={partner.link}
						key={partner.image}
						className="flex mx-6 filter grayscale hover:grayscale-0 transition-all duration-300 relative h-32 w-48 max-md:h-20"
					>
						<Image
							priority
							src={partner.image}
							alt="partner"
							layout="fill"
							objectFit="contain"
						/>
					</Link>
				))}
			</Marquee>
		</section>
	);
}
