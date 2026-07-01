"use client";

import { motion } from "framer-motion";

export default function AuroraGlow() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-45">
      <motion.div
        className="absolute top-10 left-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-teal-500/10 blur-[130px]"
        animate={{
          x: [0, 40, 0],
          y: [0, 50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-[130px]"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
