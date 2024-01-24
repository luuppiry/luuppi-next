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

  return (
    <aside className="sticky top-36 flex h-full w-full max-w-80 flex-col gap-4 rounded-lg px-4">
      <h2 className="text-xl font-bold">Tällä sivulla</h2>
      <ul>
        {headers.map((header, index) => (
          <li
            key={index}
            className={`py-2 ${activeHeader === header.id ? 'font-bold text-blue-500' : 'text-gray-700'}`}
          >
            <a href={`#${header.id}`}>
              {header.tagName.toLowerCase()}: {header.textContent}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
