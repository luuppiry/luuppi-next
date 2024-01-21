'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import { RiArrowDropDownLine, RiLoginCircleLine } from 'react-icons/ri';

const links = [
	{
		name: 'Home',
		href: '/',
		sublinks: [],
	},
	{
		name: 'Organization',
		href: '/organization',
		sublinks: [
			{
				name: 'Example 1',
				href: '/',
			},
			{
				name: 'Example 2',
				href: '/',
			},
			{
				name: 'Example 3',
				href: '/',
			},
		],
	},
	{
		name: 'Studying',
		href: '/studying',
		sublinks: [
			{
				name: 'Example 1',
				href: '/',
			},
			{
				name: 'Example 2',
				href: '/',
			},
			{
				name: 'Example 3',
				href: '/',
			},
		],
	},
	{
		name: 'Tutoring',
		href: '/services',
		sublinks: [
			{
				name: 'Example 1',
				href: '/',
			},
			{
				name: 'Example 2',
				href: '/',
			},
			{
				name: 'Example 3',
				href: '/',
			},
		],
	},
	{
		name: 'Events',
		href: '/student-union',
		sublinks: [
			{
				name: 'Example 1',
				href: '/',
			},
			{
				name: 'Example 2',
				href: '/',
			},
			{
				name: 'Example 3',
				href: '/',
			},
		],
	},
	{
		name: 'Blog',
		href: '/contact',
		sublinks: [
			{
				name: 'Example 1',
				href: '/',
			},
			{
				name: 'Example 2',
				href: '/',
			},
			{
				name: 'Example 3',
				href: '/',
			},
		],
	},
	{
		name: 'Other',
		href: '/contact',
		sublinks: [
			{
				name: 'Example 1',
				href: '/',
			},
			{
				name: 'Example 2',
				href: '/',
			},
			{
				name: 'Example 3',
				href: '/',
			},
		],
	},
];

export default function Header() {
	// Create fixed header on scroll
	const [scrollPosition, setScrollPosition] = useState(0);
	const handleScroll = () => {
		const position = window.scrollY;
		setScrollPosition(position);
	};
	window.addEventListener('scroll', handleScroll, { passive: true });

	return (
		<>
			<div className="h-36 max-lg:h-16 bg-primary-950" />
			<header
				className={`fixed bg-primary-950 text-white top-0 w-full z-50`}
			>
				<nav
					className={`bg-primary-400 px-4 max-lg:h-16 transition-all duration-300 max-lg:shadow-md ${
						scrollPosition > 100 ? 'h-16' : 'h-24'
					}`}
				>
					<div className="max-w-screen-xl mx-auto flex items-center h-full justify-between">
						<div className="relative h-full flex items-center">
							<Image
								src={'/luuppi.svg'}
								priority
								alt="Luuppi"
								className={`max-lg:w-24 transition-all duration-300 object-contain ${
									scrollPosition > 100 ? 'w-24' : 'w-36'
								}`}
								width={140}
								height={200}
							/>
						</div>
						<div className="flex gap-4 items-center">
							<button className="bg-primary-200 rounded-full p-1 max-lg:hidden">
								<Image
									src={'/us.svg'}
									alt="English"
									width={36}
									height={36}
								/>
							</button>
							<button className="bg-primary-200 px-4 py-2 rounded-lg font-bold text-xl flex items-center  max-lg:hidden">
								Login
								<RiLoginCircleLine
									className="inline-block ml-2"
									size={26}
								/>
							</button>
							<button className="lg:hidden cursor-pointer">
								<HiMenu size={36} />
							</button>
						</div>
					</div>
				</nav>
				<ul className="max-w-screen-xl mx-auto flex justify-center gap-1 px-4 max-lg:hidden">
					{links.map((link) => (
						<li
							className="group relative cursor-pointer"
							key={link.name}
						>
							<Link
								href="/"
								className="font-bold text-xl hover:bg-primary-200 h-full p-2 flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-300"
							>
								<span>{link.name}</span>
								{link.sublinks.length > 0 && (
									<div className="w-6">
										<RiArrowDropDownLine
											size={32}
											className="group-hover:rotate-180 transition-transform duration-300"
										/>
									</div>
								)}
							</Link>
							{link.sublinks.length > 0 && (
								<div className="invisible absolute z-50 flex flex-col bg-gray-100 py-4 px-2 text-gray-800 shadow-xl group-hover:visible min-w-full">
									{link.sublinks.map((sublink) => (
										<Link
											key={sublink.name}
											href="/"
											className="hover:bg-gray-200 rounded-lg p-2 truncate text-xl font-bold"
										>
											{sublink.name}
										</Link>
									))}
								</div>
							)}
						</li>
					))}
				</ul>
			</header>
		</>
	);
}
