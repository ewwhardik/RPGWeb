"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Compass, Zap, ShieldCheck } from "lucide-react";

interface GlassPortalLoaderProps {
  isVisible?: boolean;
  message?: string;
  onFinish?: () => void;
  fullScreen?: boolean;
}

const RUNIC_PHRASES = [
  "Awakening the Celestial Eye of Karmaraj...",
  "Synthesizing Cyber-Vedic Prana...",
  "Harmonizing Akashic Soul Ledgers...",
  "Aligning 7 Chakra Frequencies...",
  "Materializing Hero Avatar Sanctuary...",
];

const STAGES = [
  "Stage I: Quantum Prana Synthesis",
  "Stage II: Soul Matrix Calibration",
  "Stage III: Astral Gateway Refraction",
  "Stage IV: Sanctuary Manifestation",
];

export default function GlassPortalLoader({
  isVisible = true,
  message,
  onFinish,
  fullScreen = true,
}: GlassPortalLoaderProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    let currentProgress = 8;
    const startTime = performance.now();
    const duration = 1200; // Smooth 1.2s transition

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      currentProgress = Math.floor(8 + eased * 92);
      setProgress(currentProgress);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        if (onFinish) onFinish();
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    const phraseInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % RUNIC_PHRASES.length);
    }, 400);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearInterval(phraseInterval);
    };
  }, [isVisible, onFinish]);

  if (!isVisible) return null;

  const currentStage = STAGES[Math.min(STAGES.length - 1, Math.floor((progress / 100) * STAGES.length))];

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-[100]" : "w-full h-full min-h-[380px]"
      } flex items-center justify-center bg-[#05070a]/94 backdrop-blur-2xl transition-all duration-700 select-none overflow-hidden will-change-[opacity,transform]`}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Optimized SVG Gooey Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-glass-goo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 20 -8
              "
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="absolute w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-amber-600/15 to-yellow-500/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute w-[440px] h-[440px] rounded-full bg-cyan-600/15 blur-[110px] pointer-events-none -bottom-20 -right-20 animate-pulse delay-700" />
      <div className="absolute w-[380px] h-[380px] rounded-full bg-purple-600/15 blur-[100px] pointer-events-none -top-10 -left-10 animate-pulse delay-1000" />

      {/* Advanced Dual Astrolabe Celestial Rings */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-amber-500/20 border-dashed animate-[spin_25s_linear_infinite] pointer-events-none flex items-center justify-center">
        <span className="absolute top-0 text-[10px] text-amber-400 font-mono">✦</span>
        <span className="absolute bottom-0 text-[10px] text-amber-400 font-mono">✦</span>
        <span className="absolute left-0 text-[10px] text-cyan-400 font-mono">☸</span>
        <span className="absolute right-0 text-[10px] text-cyan-400 font-mono">☸</span>
      </div>
      <div className="absolute w-[580px] h-[580px] rounded-full border border-stone-700/40 border-dotted animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

      {/* Main Glassmorphic Portal Capsule */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full mx-4 p-6 sm:p-8 rounded-3xl bg-[#0c1017]/85 border-2 border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.15)] backdrop-blur-2xl">
        {/* Specular Sheen Sweep Reflection */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rotate-45 pointer-events-none animate-[pulse_3s_ease-in-out_infinite]" />

        {/* 1. LIQUID GLASS MERGING METABALLS CONTAINER */}
        <div
          className="relative w-40 h-40 flex items-center justify-center mb-6 will-change-transform"
          style={{ filter: "url(#liquid-glass-goo)" }}
        >
          {/* Core Glass Sphere */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.7)] animate-[spin_6s_linear_infinite]" />

          {/* Liquid Glass Orb 1 (Orbiting & Merging) */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_24px_rgba(6,182,212,0.7)] animate-glass-merge-1" />

          {/* Liquid Glass Orb 2 (Orbiting & Merging) */}
          <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tl from-purple-400 to-pink-600 shadow-[0_0_24px_rgba(168,85,247,0.7)] animate-glass-merge-2" />

          {/* Liquid Glass Orb 3 (Pulsing Core) */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-emerald-400 to-amber-500 shadow-[0_0_28px_rgba(16,185,129,0.6)] animate-glass-merge-3" />
        </div>

        {/* High-Refraction Center Emblem */}
        <div className="absolute top-[58px] w-14 h-14 rounded-2xl bg-black/50 border border-white/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.7)] pointer-events-none transform rotate-45">
          <div className="transform -rotate-45 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/karmaraj_emblem.png"
              alt="Karmaraj Rune"
              className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse"
            />
          </div>
        </div>

        {/* Title & Status */}
        <div className="text-center space-y-1.5 mt-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-black font-title tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
              KARMARAJ
            </h2>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PORTAL ACTIVE
            </span>
          </div>

          <div className="text-[10px] font-mono text-amber-400/90 font-bold tracking-wider uppercase">
            {currentStage}
          </div>

          <p className="text-xs text-stone-300 font-medium tracking-wide h-5 transition-all duration-300 flex items-center justify-center gap-1.5 line-clamp-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{message || RUNIC_PHRASES[phaseIndex]}</span>
          </p>
        </div>

        {/* Liquid Glass Progress Bar */}
        <div className="w-full mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>SYNCHRONIZING REALM</span>
            </span>
            <span className="text-amber-300 font-bold font-mono text-xs">{progress}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#080b10] p-0.5 border border-white/15 shadow-inner overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 transition-all duration-100 relative shadow-[0_0_15px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer light streak passing across bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Micro-hint */}
        <div className="text-[9px] text-stone-500 font-mono mt-4 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Vedic Life Engine Encrypted • Real-time Sync</span>
        </div>
      </div>
    </div>
  );
}
