"use client";

import { motion } from "framer-motion";

export function HeroLogo({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.75, rotate: 12, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 120,
        delay: 0.2,
      }}
      className="relative cursor-pointer group"
      whileHover={{ scale: 1.15, rotate: -4 }}
    >
      <div className="absolute inset-0 rounded-2xl bg-indigo-500/25 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {children}
    </motion.div>
  );
}

export function HeroTitle({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 select-none">
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block mr-3 whitespace-nowrap">
          {word.split("").map((char, charIdx) => (
            <motion.span
              key={charIdx}
              className="inline-block"
              initial={{ filter: "blur(8px)", y: 15, opacity: 0 }}
              animate={{ filter: "blur(0px)", y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 150,
                delay: 0.35 + (wordIdx * 0.1) + (charIdx * 0.03),
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}

export function HeroSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        damping: 22,
        stiffness: 130,
        delay: 0.7,
      }}
    >
      {children}
    </motion.div>
  );
}
