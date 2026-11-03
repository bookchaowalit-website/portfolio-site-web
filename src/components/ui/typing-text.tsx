"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface TypingTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypingText({ 
  text, 
  delay = 0, 
  speed = 50, 
  className = "",
  onComplete 
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? delay : speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, delay, speed, isComplete, onComplete, isMounted]);

  // Show complete text during SSR/initial render to prevent hydration mismatch
  if (!isMounted) {
    return (
      <span className={className}>
        {text}
      </span>
    );
  }

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
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
    </span>
  );
}