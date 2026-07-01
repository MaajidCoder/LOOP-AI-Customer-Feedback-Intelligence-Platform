"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function CursorTrail() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [prefersReducedMotion]);

  if (!mounted || prefersReducedMotion || !coords) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-pink-500/60 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 bg-pink-500/10 mix-blend-screen"
      animate={{
        x: coords.x,
        y: coords.y,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 300,
        mass: 0.5,
      }}
    />
  );
}
