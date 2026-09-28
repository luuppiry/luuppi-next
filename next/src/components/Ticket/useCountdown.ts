import { useEffect, useState } from 'react';

export function useCountdown(target: Date) {
  const calc = () => Math.max(0, target.getTime() - Date.now());
  const [remaining, setRemaining] = useState(calc);

  useEffect(() => {
    if (calc() === 0) return setRemaining(0);
    const id = setInterval(() => {
      const r = calc();
      setRemaining(r);
      if (r === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()]);

  const s = Math.floor(remaining / 1000);
  return {
    started: remaining === 0,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
