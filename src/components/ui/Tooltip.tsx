import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    // Posición centrada horizontalmente, debajo del elemento
    const x = rect.left + scrollX + rect.width / 2;
    const y = rect.bottom + scrollY + 8; // 8px de separación

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    calculatePosition();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  const tooltipElement = isVisible ? (
    <div
      className="fixed z-[10000] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 max-w-xs text-center whitespace-normal"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {content}
      {/* Flecha hacia arriba */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900" />
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};