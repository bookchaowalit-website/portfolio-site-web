"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useDarkMode } from '@/hooks/use-dark-mode';

// Hand-drawn highlight marker effect
export function HandDrawnHighlight({
  children,
  className = "",
  color = "yellow"
}: {
  children: React.ReactNode;
  className?: string;
  color?: "yellow" | "pink" | "green" | "blue";
}) {
  const reducedMotion = useReducedMotion();
  const isDark = useDarkMode();
  // Variant names remain stable for callers; the visual system is now tonal grayscale.
  const lightMap = {
    yellow: "oklch(0.86 0 0 / 0.38)",
    pink: "oklch(0.82 0 0 / 0.32)",
    green: "oklch(0.78 0 0 / 0.28)",
    blue: "oklch(0.74 0 0 / 0.24)"
  };
  const darkMap = {
    yellow: "oklch(0.62 0 0 / 0.42)",
    pink: "oklch(0.68 0 0 / 0.36)",
    green: "oklch(0.74 0 0 / 0.30)",
    blue: "oklch(0.80 0 0 / 0.26)"
  };
  const colorMap = isDark ? darkMap : lightMap;
  return (
    <span className={`relative ${className}`}>
      <motion.span
        className="absolute inset-0 -m-1"
        style={{
          background: colorMap[color],
          transform: "rotate(-1deg) skew(-2deg)",
          clipPath: "polygon(2% 10%, 98% 5%, 96% 90%, 4% 95%)"
        }}
        initial={reducedMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

// Notebook paper background with optional tonal variants
export function NotebookPaper({
  children,
  className = "",
  color = "default"
}: {
  children: React.ReactNode;
  className?: string;
  color?: "default" | "yellow" | "pink" | "green" | "blue";
}) {
  const isDark = useDarkMode();
  // Tonal paper variants distinguish sections without introducing brand colors.
  const lightBg = {
    default: "oklch(0.985 0 0)",
    yellow: "oklch(0.975 0 0)",
    pink: "oklch(0.965 0 0)",
    green: "oklch(0.955 0 0)",
    blue: "oklch(0.945 0 0)"
  };
  const darkBg = {
    default: "oklch(0.20 0 0)",
    yellow: "oklch(0.24 0 0)",
    pink: "oklch(0.23 0 0)",
    green: "oklch(0.22 0 0)",
    blue: "oklch(0.21 0 0)"
  };
  const bgMap = isDark ? darkBg : lightBg;
  const ruleColor = isDark ? "oklch(0.32 0 0 / 0.4)" : "oklch(0.85 0 0 / 0.5)";
  const marginColor = isDark ? "oklch(0.62 0 0 / 0.45)" : "oklch(0.55 0 0 / 0.48)";
  return (
    <div className={`relative ${className}`}>
      {/* Neutral paper texture background */}
      <div className="absolute inset-0" style={{ background: bgMap[color] }} />

      {/* Notebook ruled lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${(i + 1) * 5}%`,
              transform: `rotate(${((i % 3) - 1) * 0.2}deg)`,
              background: ruleColor
            }}
          />
        ))}
      </div>

      {/* Red margin line */}
      <div
        className="absolute left-12 top-0 bottom-0 w-px"
        style={{ background: marginColor, transform: "rotate(0.2deg)" }}
      />

      {/* Three-ring holes */}
      <div className="absolute left-4 top-1/4 w-3 h-3 rounded-full bg-background shadow-inner border border-border/50" />
      <div className="absolute left-4 top-1/2 w-3 h-3 rounded-full bg-background shadow-inner border border-border/50" />
      <div className="absolute left-4 top-3/4 w-3 h-3 rounded-full bg-background shadow-inner border border-border/50" />

      <div className="relative z-10 p-8">{children}</div>
    </div>
  );
}

// Hand-drawn sticky note
export function StickyNote({
  children,
  rotation = 0,
  className = "",
  color = "yellow"
}: {
  children: React.ReactNode;
  rotation?: number;
  className?: string;
  color?: "yellow" | "pink" | "green" | "blue";
}) {
  const reducedMotion = useReducedMotion();
  const isDark = useDarkMode();
  // Four tonal variants from the shared monochrome notebook palette.
  const lightColorMap = {
    yellow: { bg: "oklch(0.95 0 0)", border: "oklch(0.80 0 0)" },
    pink: { bg: "oklch(0.93 0 0)", border: "oklch(0.76 0 0)" },
    green: { bg: "oklch(0.91 0 0)", border: "oklch(0.72 0 0)" },
    blue: { bg: "oklch(0.89 0 0)", border: "oklch(0.68 0 0)" }
  };
  const darkColorMap = {
    yellow: { bg: "oklch(0.28 0 0)", border: "oklch(0.42 0 0)" },
    pink: { bg: "oklch(0.26 0 0)", border: "oklch(0.38 0 0)" },
    green: { bg: "oklch(0.24 0 0)", border: "oklch(0.34 0 0)" },
    blue: { bg: "oklch(0.22 0 0)", border: "oklch(0.30 0 0)" }
  };
  const colorMap = isDark ? darkColorMap : lightColorMap;
  const c = colorMap[color];
  return (
    <motion.div
      className={`border-2 border-dashed p-4 shadow-md font-[family-name:var(--font-doodle)] sticky-note ${className}`}
      style={{
        background: c.bg,
        borderColor: c.border,
        transform: `rotate(${rotation}deg)`,
        clipPath: "polygon(0% 0%, 95% 0%, 100% 8%, 100% 100%, 5% 100%, 0% 92%)"
      }}
      initial={reducedMotion ? false : { scale: 0, rotate: rotation - 45 }}
      animate={{ scale: 1, rotate: rotation }}
      // Critically damped (2*sqrt(200) ~ 28): no overshoot, so the note never
      // grows past its box and makes narrow phones scroll sideways.
      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 30 }}
      whileHover={reducedMotion ? undefined : {
        scale: 1.04,
        rotate: rotation + 1.5,
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={reducedMotion ? undefined : {
        scale: 0.98,
        rotate: rotation - 1,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  );
}

// Hand-drawn arrows with different styles
export function SketchArrow({
  direction = "right",
  style = "straight",
  className = "",
  label = ""
}: {
  direction?: "up" | "down" | "left" | "right";
  style?: "straight" | "curved" | "zigzag";
  className?: string;
  label?: string;
}) {
  const reducedMotion = useReducedMotion();
  const rotations = { right: 0, down: 90, left: 180, up: 270 };

  const paths = {
    straight: "M5 15c10-2 20 2 30-1 8-2 15 1 20-1",
    curved: "M5 20c8-5 15-2 25-8 6-4 12-1 18-5",
    zigzag: "M5 15l8-3 8 6 8-4 8 2 8-3"
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.svg
        width="80"
        height="30"
        viewBox="0 0 80 30"
        style={{ transform: `rotate(${rotations[direction]}deg)` }}
        className="text-primary/60"
      >
        <motion.path
          d={paths[style]}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M65 12l8 3-3 3"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 1.5, ease: "easeInOut" }}
        />
      </motion.svg>
      {label && (
        <motion.span
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-[family-name:var(--font-doodle)] text-muted-foreground whitespace-nowrap"
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 2 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}

// Sketchy border frame
export function SketchyFrame({
  children,
  className = "",
  variant = "dashed"
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "dashed" | "double" | "wavy";
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={`relative ${className}`}>
      {children}
      {variant === "dashed" && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 border-2 border-dashed border-primary/40"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        />
      )}
      {variant === "double" && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-1 border border-primary/60"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 border border-secondary/60"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.08, ease: "easeOut" }}
          />
        </>
      )}
      {variant === "wavy" && (
        <motion.svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        >
          <motion.path
            d="M8 4 Q12 2 16 4 T24 4 T32 4 T40 4 L92 4 Q96 8 92 12 L92 88 Q88 92 92 96 L40 96 T32 96 T24 96 T16 96 Q12 94 8 96 L8 96 Q4 92 8 88 L8 12 Q4 8 8 4"
            vectorEffect="non-scaling-stroke"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-accent/50"
          />
        </motion.svg>
      )}
    </div>
  );
}

// Hand-drawn bracket/brace
export function HandDrawnBracket({
  side = "left",
  height = 100,
  className = ""
}: {
  side?: "left" | "right";
  height?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const path = side === "left"
    ? `M15 5 Q5 5 5 ${height/2} Q5 ${height-5} 15 ${height-5}`
    : `M5 5 Q15 5 15 ${height/2} Q15 ${height-5} 5 ${height-5}`;

  return (
    <motion.svg
      width="20"
      height={height}
      viewBox={`0 0 20 ${height}`}
      className={`text-primary/50 ${className}`}
    >
      <motion.path
        d={path}
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={reducedMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 1, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}
