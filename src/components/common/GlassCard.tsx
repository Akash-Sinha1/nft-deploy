"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  animate?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  animate = true,
  delay = 0,
  ...props
}: GlassCardProps) {
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: "easeOut" as const },
      }
    : {};

  if (animate) {
    return (
      <motion.div
        className={cn(
          "glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
          hoverEffect && "glass-panel-hover",
          className
        )}
        {...animationProps}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {/* Subtle interior glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.04] pointer-events-none rounded-2xl" />
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        hoverEffect && "glass-panel-hover",
        className
      )}
      {...props}
    >
      {/* Subtle interior glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.04] pointer-events-none rounded-2xl" />
      {children}
    </div>
  );
}
