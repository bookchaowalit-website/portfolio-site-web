"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface HeroTypingTextProps {
  greeting: string;
  name: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

export function HeroTypingText({
  greeting,
  name,
  delay = 0,
  onComplete
}: HeroTypingTextProps) {
  const [showCursor, setShowCursor] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const cursorTimer = setTimeout(() => {
      setShowCursor(true);
      onComplete?.();
    }, delay);

    return () => clearTimeout(cursorTimer);
  }, [delay, onComplete]);

  return (
    <>
      {greeting}{' '}
      <span className="font-bold text-foreground pb-1 inline-block">{name}</span>
      {showCursor && (
        <motion.span
          aria-hidden="true"
          data-motion-loop=""
          animate={reducedMotion ? {} : { opacity: [1, 0, 1] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          |
        </motion.span>
      )}
    </>
  );
}
