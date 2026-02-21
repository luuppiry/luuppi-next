'use client';
import { useEffect, useRef, useState } from 'react';
import { BiZoomIn, BiZoomOut } from 'react-icons/bi';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1;
const STEP = 0.05;
const INITIAL_DELAY = 400;
const REPEAT_INTERVAL = 100;

export default function TableZoomControl() {
  const [zoom, setZoom] = useState(0.875);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const deltaRef = useRef(0);

  useEffect(() => {
    const element = document.getElementById('registrations-table');
    const table = element?.querySelector('table') as HTMLElement;
    if (table) table.style.fontSize = `${zoom}rem`;
  }, [zoom]);

  const clamp = (n: number) => Math.min(Math.max(n, MIN_ZOOM), MAX_ZOOM);

  const startInterval = (delta: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setZoom((z) => clamp(z + delta));
    }, REPEAT_INTERVAL);
  };

  const startHold = (delta: number) => {
    isHoldingRef.current = true;
    deltaRef.current = delta;
    timeoutRef.current = setTimeout(() => startInterval(delta), INITIAL_DELAY);
  };

  const stopHold = () => {
    isHoldingRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const changeDirection = (delta: number) => {
    if (!isHoldingRef.current) return;
    deltaRef.current = delta;
    if (intervalRef.current) startInterval(delta);
  };

  useEffect(() => stopHold, []);

  const holdProps = (delta: number) => ({
    onClick: () => setZoom((z) => clamp(z + delta)),
    onMouseDown: () => startHold(delta),
    onMouseUp: stopHold,
    onMouseEnter: () => changeDirection(delta),
    onTouchStart: () => startHold(delta),
    onTouchEnd: stopHold,
  });

  return (
    <div className="flex" onMouseLeave={stopHold} onMouseUp={stopHold}>
      <button
        aria-label="Reduce table zoom"
        className="flex p-1"
        {...holdProps(-STEP)}
      >
        <BiZoomOut size={24} />
      </button>
      <button
        aria-label="Increase table zoom"
        className="flex p-1"
        {...holdProps(STEP)}
      >
        <BiZoomIn size={24} />
      </button>
    </div>
  );
}
