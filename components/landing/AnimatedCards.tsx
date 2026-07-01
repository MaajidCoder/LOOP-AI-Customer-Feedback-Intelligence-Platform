"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";

export function AnimatedCardsContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-10"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.9,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt variables
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { damping: 20, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { damping: 20, stiffness: 200 });

  const mx = useTransform(x, (val) => `${(val + 0.5) * 100}%`);
  const my = useTransform(y, (val) => `${(val + 0.5) * 100}%`);
  const bgTemplate = useMotionTemplate`radial-gradient(150px circle at ${mx} ${my}, rgba(99,102,241,0.15), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      variants={{
        hidden: { y: 35, opacity: 0, scale: 0.96 },
        visible: { y: 0, opacity: 1, scale: 1 },
      }}
      transition={{ type: "spring", damping: 20, stiffness: 120 }}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative rounded-2xl border border-slate-900 bg-slate-900/25 p-5 backdrop-blur-lg hover:border-slate-800 transition-colors duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/5 group"
    >
      {/* Card Spotlight Border Light effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl pointer-events-none"
          style={{ background: bgTemplate }}
        />
      )}
      
      {/* 3D Content wrapper */}
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

export function FloatingIcon({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20"
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{ scale: 1.15, rotate: 5, backgroundColor: "rgba(99, 102, 241, 0.25)" }}
    >
      {children}
    </motion.div>
  );
}
