'use client';

import { useEffect, useState } from 'react';

interface RegistrationCounterProps {
  expiresAt: Date;
}

export default function RegistrationCounter({
  expiresAt,
}: RegistrationCounterProps) {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setMinutes(minutes);
      setSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div>
      <span className="countdown flex items-center text-sm max-md:flex-1">
        {/* @ts-expect-error not supported */}
        <span style={{ '--value': minutes }} />m
        {/* @ts-expect-error not supported */}
        <span style={{ '--value': seconds }} />s
      </span>
    </div>
  );
}
