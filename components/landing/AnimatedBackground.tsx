"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] bg-repeat pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35"
      />

      {/* Twinkling Stars */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-white"
            style={{
              top: `${(i * 17) % 100}%`,
              left: `${(i * 29) % 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2.5 + ((i * 7) % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i * 0.3) % 4,
            }}
          />
        ))}
      </div>

      {/* Ambient Breathing Glow */}
      <motion.div
        className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-indigo-500/10 blur-[140px]"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -50, 60, 0],
          scale: [1, 1.12, 0.9, 1],
          opacity: [0.5, 0.8, 0.6, 0.5],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 right-1/4 h-[550px] w-[550px] rounded-full bg-purple-500/10 blur-[140px]"
        animate={{
          x: [0, -90, 40, 0],
          y: [0, 60, -50, 0],
          scale: [1.1, 0.9, 1.15, 1.1],
          opacity: [0.4, 0.75, 0.5, 0.4],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
