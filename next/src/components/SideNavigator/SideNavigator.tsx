'use client';
import { Dictionary } from '@/models/locale';
import { useEffect, useRef, useState } from 'react';

interface SideNavigatorProps {
  targetClass: string;
  dictionary: Dictionary;
}

export default function SideNavigator({
  targetClass,
  dictionary,
}: SideNavigatorProps) {
  const [headers, setHeaders] = useState<Element[]>([]);
  const [activeHeader, setActiveHeader] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const element = document.getElementsByClassName(targetClass)?.[0];
    if (!element) return;

    const headerElements = Array.from(
      document
        .getElementsByClassName(targetClass)[0]
        .querySelectorAll('h1, h2'),
    );
    setHeaders(headerElements);

    const handleScroll = () => {
      let currentHeader = '';
      for (let i = headerElements.length - 1; i >= 0; i--) {
        const header = headerElements[i];
        const headerTop = header.getBoundingClientRect().top;
        if (headerTop <= 200) {
          currentHeader = header.id;
          break;
        }
      }
      setActiveHeader(currentHeader);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [targetClass]);

  useEffect(() => {
    if (!activeHeader || !listRef.current) return;

    const activeElement = listRef.current.querySelector(
      `[data-header-id="${activeHeader}"]`,
    );

    if (activeElement instanceof HTMLElement) {
      const elementTop = activeElement.offsetTop;
      const containerHeight = listRef.current.clientHeight;
      const elementHeight = activeElement.offsetHeight;

      listRef.current.scrollTop =
        elementTop - containerHeight / 2 + elementHeight / 2;
    }
  }, [activeHeader]);

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
    <aside className="flex flex-col gap-2 px-4">
      <p className="text-lg font-bold">{dictionary.general.on_this_page}</p>
      <div className="relative">
        <div className="pointer-events-none absolute top-0 z-10 h-4 w-full bg-gradient-to-b from-white to-transparent" />
        <ul
          ref={listRef}
          className="scrollbar-custom max-h-[calc(100vh-400px)] overflow-y-auto pr-2"
        >
          {headers.map((header, index) => (
            <li
              key={index}
              className={`flex items-center gap-4 py-2 ${activeHeader === header.id ? 'font-bold text-secondary-400' : ''}`}
              data-header-id={header.id}
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
        <div className="pointer-events-none absolute bottom-0 z-10 h-4 w-full bg-gradient-to-t from-white to-transparent" />
      </div>
    </aside>
  );
}
