'use client';

import { useRouter } from 'next/navigation';
import { addTransitionType, startTransition, useEffect } from 'react';

interface Props {
  prevHref?: string;
  nextHref?: string;
}

export default function KeyboardNavigation({ prevHref, nextHref }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Warm up both neighbours so the arrow keys feel instant
    if (prevHref) router.prefetch(prevHref);
    if (nextHref) router.prefetch(nextHref);

    const go = (href: string, type: 'nav-back' | 'nav-forward') => {
      startTransition(() => {
        addTransitionType(type);
        router.push(href, { scroll: false });
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack browser/OS shortcuts
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevHref) {
        e.preventDefault();
        go(prevHref, 'nav-back');
      } else if (e.key === 'ArrowRight' && nextHref) {
        e.preventDefault();
        go(nextHref, 'nav-forward');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [prevHref, nextHref, router]);

  return null;
}
