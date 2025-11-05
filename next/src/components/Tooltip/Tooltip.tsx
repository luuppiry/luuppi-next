'use client';
import { RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

interface Position {
  top: number;
  left: number;
}

export default function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = triggerRect.top - tooltipRect.height - 5;
    let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    // Adjust if tooltip goes off the left edge
    if (left < 8) {
      left = 8;
    }

    // Adjust if tooltip goes off the right edge
    if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }

    // If tooltip goes off the top, show it below instead
    if (top < 8) {
      top = triggerRect.bottom + 8;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    setIsExiting(false);

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (isVisible) {
      setIsExiting(true);

      setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 150);
    }
  };

  useEffect(() => {
    if (isVisible) {
      requestAnimationFrame(updatePosition);

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  const tooltipElement =
    isVisible && mounted ? (
      <div
        ref={tooltipRef}
        className={`tooltip pointer-events-none fixed z-[9999] max-w-xs rounded bg-gray-800 p-1 px-2 text-sm text-[var(--tooltip-text-color)] ${
          isExiting ? 'animate-tooltip-exit' : 'animate-tooltip'
        }`}
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
        }}
      >
        {content}
        <Arrow position={position} triggerRef={triggerRef} />
      </div>
    ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="block w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {mounted && tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
}

interface ArrowProps {
  triggerRef: RefObject<HTMLSpanElement | null>;
  position: Position;
}

const Arrow = ({ position, triggerRef }: ArrowProps) => (
  <div
    className="absolute h-1 w-1 rotate-45 bg-gray-800"
    style={{
      bottom:
        position.top < triggerRef.current!.getBoundingClientRect().top
          ? '-2px'
          : 'auto',
      top:
        position.top >= triggerRef.current!.getBoundingClientRect().top
          ? '-2px'
          : 'auto',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
    }}
  />
);
