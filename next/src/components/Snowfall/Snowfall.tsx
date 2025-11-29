'use client';

import ReactSnowfall from 'react-snowfall';

export default function Snowfall() {
  return (
    <ReactSnowfall
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
