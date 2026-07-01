"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export default function MouseSpotlight() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { damping: 45, stiffness: 250 });
  const springY = useSpring(mouseY, { damping: 45, stiffness: 250 });

  const background = useMotionTemplate`radial-gradient(800px circle at ${springX}px ${springY}px, rgba(20,184,166,0.18), transparent 80%)`;

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background }}
    />
  );
}
