"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Design floor (ADR-0007, rule reduced-motion): framer-motion animations
// follow the visitor's prefers-reduced-motion setting.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
