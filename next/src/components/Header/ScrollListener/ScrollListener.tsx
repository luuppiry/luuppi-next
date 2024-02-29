'use client';
import { useEffect } from 'react';

export default function ScrollListener() {
  const handleScroll = () => {
    const position = window.scrollY;
    const textElements = document.getElementsByClassName('custom-scroll-text');
    const navElement = document.getElementsByClassName('custom-scroll-nav');
    const navLogoElement = document.getElementsByClassName(
      'custom-scroll-nav-image',
    );

    if (position > 100) {
      for (let i = 0; i < textElements.length; i++) {
        if (textElements[i].classList.contains('text-lg')) {
          textElements[i].classList.replace('text-lg', 'text-base');
        }
      }

      navElement[0].classList.replace('h-24', 'h-16');
      navLogoElement[0].classList.replace('w-36', 'w-24');
    } else {
      for (let i = 0; i < textElements.length; i++) {
        if (textElements[i].classList.contains('text-base')) {
          textElements[i].classList.replace('text-base', 'text-lg');
        }
      }

      navElement[0].classList.replace('h-16', 'h-24');
      navLogoElement[0].classList.replace('w-24', 'w-36');
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}
