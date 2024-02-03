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
        .querySelectorAll('h1, h2'),
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

  if (!headers.length) return null;

  return (
    <aside className="flex flex-col gap-4 px-4 pb-4">
      <h6 className="text-lg font-bold">{dictionary.general.on_this_page}</h6>
      <ul>
        {headers.map((header, index) => (
          <li
            key={index}
            className={`flex items-center gap-4 py-2 ${activeHeader === header.id ? 'font-bold text-secondary-400' : ''}`}
          >
            <span
              className={`h-0.5 flex-shrink-0 bg-secondary-400 ${activeHeader === header.id ? 'w-5' : 'w-2'} transition-all duration-300 ease-in-out`}
            />
            <button
              className="truncate text-left"
              title={header.textContent?.replace(/\d+§/, '') ?? ''}
              onClick={() => scrollToElement(header.id)}
            >
              <p className="truncate text-sm">
                {header.textContent?.replace(/\d+§/, '')}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
