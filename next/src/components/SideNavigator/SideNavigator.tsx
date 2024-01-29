'use client';
import { getDictionary } from '@/dictionaries';
import { useEffect, useState } from 'react';

export default function SideNavigator({
  targetClass,
  dictionary,
}: {
  targetClass: string;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const [headers, setHeaders] = useState<Element[]>([]);
  const [activeHeader, setActiveHeader] = useState('');

  useEffect(() => {
    const headerElements = Array.from(
      document
        .getElementsByClassName(targetClass)[0]
        .querySelectorAll('h1, h2, h3, h4, h5, h6'),
    );
    setHeaders(headerElements);

    const handleScroll = () => {
      let currentHeader = '';
      headerElements.forEach((header) => {
        const headerTop = header.getBoundingClientRect().top;
        if (headerTop < window.innerHeight * 0.2) {
          currentHeader = header.id;
        }
      });
      setActiveHeader(currentHeader);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [targetClass]);

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    const fixedHeaderOffset = 112;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element?.getBoundingClientRect().top;
    if (!elementRect) return;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - fixedHeaderOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  return (
    <aside className="luuppi-custom-scroll sticky top-36 flex h-full max-h-[calc(100vh-112px-32px)] w-full max-w-80 flex-col gap-4 rounded-lg px-4 pb-4 max-lg:hidden">
      <h2 className="text-lg font-bold">{dictionary.general.on_this_page}</h2>
      <ul>
        {headers.map((header, index) => (
          <li
            key={index}
            className={`flex items-center gap-4 py-2 ${activeHeader === header.id ? 'font-bold text-primary-400' : ''}`}
          >
            <span
              className={`h-0.5 flex-shrink-0 bg-primary-400 ${activeHeader === header.id ? 'w-5' : 'w-2'} transition-all duration-300 ease-in-out`}
            />
            <button
              className="max-w-full break-all text-left"
              title={header.textContent ?? ''}
              onClick={() => scrollToElement(header.id)}
            >
              <p className="line line-clamp-2 text-sm">{header.textContent}</p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
