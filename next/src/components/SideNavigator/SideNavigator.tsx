'use client';
import { useEffect, useState } from 'react';

export default function SideNavigator({
  targetClass,
}: {
  targetClass: string;
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
    <aside className="luuppi-custom-scroll sticky top-36 flex h-full max-h-[calc(100vh-112px-32px)] w-full max-w-80 flex-col gap-4 rounded-lg px-4 pb-4">
      <h2 className="text-xl font-bold">Tällä sivulla</h2>
      <ul>
        {headers.map((header, index) => (
          <li
            key={index}
            className={`py-2 ${activeHeader === header.id ? 'font-bold text-primary-400' : ''}`}
            style={{
              paddingLeft: `${(Number(header.tagName.charAt(1)) - 1) * 15}px`,
            }}
          >
            <button
              onClick={() => scrollToElement(header.id)}
              className="max-w-full break-all text-left"
              title={header.textContent ?? ''}
            >
              <p className="line line-clamp-2">{header.textContent}</p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
