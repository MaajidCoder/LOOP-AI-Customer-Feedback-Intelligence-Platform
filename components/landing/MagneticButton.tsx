"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isPrimary?: boolean;
}

export default function MagneticButton({ children, className = "", onClick, isPrimary = false }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { damping: 15, stiffness: 150 });
  const springY = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      onClick={onClick}
      className="w-full sm:w-auto"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden w-full select-none cursor-pointer flex items-center justify-center ${className}`}
      >
        {/* Shimmer sweep effect */}
        {isHovered && (
          <motion.div
            className="absolute top-0 bottom-0 left-[-50%] w-[30%] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[25deg] pointer-events-none"
            initial={{ left: "-50%" }}
            animate={{ left: "150%" }}
            transition={{
              duration: 0.85,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          />
        )}
        {children}
      </motion.button>
    </motion.div>
  );
}
