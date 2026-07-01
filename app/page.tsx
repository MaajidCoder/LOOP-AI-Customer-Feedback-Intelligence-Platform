import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Shield, FileSpreadsheet, ArrowRight } from "lucide-react";

import AnimatedBackground from "@/components/landing/AnimatedBackground";
import FloatingParticles from "@/components/landing/FloatingParticles";
import AuroraGlow from "@/components/landing/AuroraGlow";
import MouseSpotlight from "@/components/landing/MouseSpotlight";
import { HeroLogo, HeroTitle, HeroSubtitle } from "@/components/landing/HeroAnimations";
import { AnimatedCardsContainer, AnimatedCard, FloatingIcon } from "@/components/landing/AnimatedCards";
import MagneticButton from "@/components/landing/MagneticButton";
import CursorTrail from "@/components/landing/CursorTrail";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-16">
      {/* Premium Background Layers */}
      <AnimatedBackground />
      <AuroraGlow />
      <FloatingParticles />
      <MouseSpotlight />
      <CursorTrail />

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
        {/* Brand Icon Header */}
        <div className="flex flex-col items-center space-y-4">
          <HeroLogo>
            <div className="relative h-28 w-48 overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="LOOP Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </HeroLogo>
          
          <HeroTitle text="LOOP" />
          
          <HeroSubtitle>
            <p className="text-lg text-slate-450 max-w-md mx-auto leading-relaxed font-medium">
              AI Customer-Feedback Intelligence Platform. Ingest feedback, analyze trends, and close the loop.
            </p>
          </HeroSubtitle>
        </div>

        {/* Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <MagneticButton className="w-full sm:w-auto">
            <Link
              href="/login"
              className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/40 px-6 py-3.5 text-sm font-semibold text-slate-300 transition duration-200 hover:bg-slate-800/80 hover:text-white backdrop-blur-md"
            >
              Sign In
            </Link>
          </MagneticButton>
          <MagneticButton className="w-full sm:w-auto" isPrimary>
            <Link
              href="/signup"
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-1" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </main>
  );
}
