"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  active?: boolean;
}

export function ConfettiEffect({ active = true }: ConfettiEffectProps) {
  useEffect(() => {
    if (!active) return;

    // Trigger explosive confetti on mount
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#0052ff", "#00d2ff", "#7a00ff", "#10b981"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#0052ff", "#00d2ff", "#7a00ff", "#10b981"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [active]);

  return null;
}
