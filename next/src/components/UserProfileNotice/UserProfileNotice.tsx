'use client';

import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';

interface MissingFieldsResponse {
  isComplete: boolean;
}

import { usePathname } from 'next/navigation';

export default function UserProfileNotice({
  lang,
  dictionary,
}: {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}) {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<MissingFieldsResponse | null>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    fetch('/api/users/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MissingFieldsResponse | null) => {
        if (!cancelled && data) setResult(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [status, session?.user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isOnProfilePage = pathname === `/${lang}/profile`;

  if (!result || result.isComplete || isOnProfilePage) return null;

  return (
    <aside
      className={`fixed top-16 z-40 flex w-full flex-wrap items-center justify-center gap-3 bg-red-300 px-4 py-2 text-sm text-red-950 transition-all duration-300 ease-out lg:top-28 ${scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      role="status"
    >
      <span className="flex items-center gap-2">
        <HiOutlineExclamationCircle
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
        />
        {dictionary.auth.missing_required_info}
      </span>

      <Link className="link" href={`/${lang}/profile`}>
        {dictionary.auth.provide_missing_info}
      </Link>
    </aside>
  );
}
