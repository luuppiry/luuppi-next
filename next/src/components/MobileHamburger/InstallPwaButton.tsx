'use client';
import { Dictionary } from '@/models/locale';
import { useEffect, useState } from 'react';

interface InstallPwaButtonProps {
  dictionary: Dictionary;
}

export default function InstallPwaButton({
  dictionary,
}: InstallPwaButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      });
    };
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const isPwa = () => window.matchMedia('(display-mode: standalone)')?.matches;

  const supportsPwa = () =>
    typeof window.matchMedia('(display-mode: standalone)') !== 'undefined';

  const useragent = navigator.userAgent;
  const isAndroid = useragent.indexOf('Android') > -1;

  return (
    <button
      className={`btn btn-primary w-full ${isPwa() || !supportsPwa() || !isAndroid ? 'hidden' : ''}`}
      onClick={installPwa}
    >
      {dictionary.general.install_pwa}
    </button>
  );
}
