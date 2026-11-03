"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface SmoothTypingTextProps {
  fullText: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  highlightAfter?: string; // Text after which to apply gradient
}

export function SmoothTypingText({
  fullText,
  delay = 0,
  speed = 80,
  className = "",
  onComplete,
  highlightAfter
}: SmoothTypingTextProps) {
  const [displayText, setDisplayText] = useState(fullText); // Start with full text for SSR
  const [currentIndex, setCurrentIndex] = useState(fullText.length); // Start at end
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Start the typing animation after mount
    const startAnimation = setTimeout(() => {
      setDisplayText(""); // Clear text
      setCurrentIndex(0); // Reset index
      setIsAnimating(true);
      setShowCursor(true);
    }, delay);

    return () => clearTimeout(startAnimation);
  }, [delay]);

  useEffect(() => {
    if (!isAnimating || currentIndex >= fullText.length) {
      if (currentIndex >= fullText.length && isAnimating) {
        setIsAnimating(false);
        setShowCursor(false);
        onComplete?.();
      }
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(prev => prev + fullText[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, fullText, speed, isAnimating, onComplete]);

  // Split text into parts for gradient styling
  const renderText = () => {
    if (!highlightAfter) {
      return displayText;
    }

    const splitIndex = displayText.indexOf(highlightAfter);
    if (splitIndex === -1 || displayText.length <= highlightAfter.length) {
      // If we haven't reached the highlight point yet, show normal text
      return displayText;
    }

    const beforeHighlight = displayText.substring(0, highlightAfter.length);
    const afterHighlight = displayText.substring(highlightAfter.length);

    return (
      <>
        {beforeHighlight}
        <span className="font-semibold text-foreground">
          {afterHighlight}
        </span>
      </>
    );
  };

  return (
    <span className={className}>
      {renderText()}
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
    </span>
  );
}
