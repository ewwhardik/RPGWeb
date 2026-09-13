"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Compass } from "lucide-react";

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

export default function GlassPortalLoader({
  isVisible = true,
  message,
  onFinish,
  fullScreen = true,
}: GlassPortalLoaderProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (!isVisible) return;

    // Progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 14) + 6;
        return Math.min(98, prev + delta);
      });
    }, 180);

    // Phase messages cycle
    const phraseInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % RUNIC_PHRASES.length);
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-[100]" : "w-full h-full min-h-[380px]"
      } flex items-center justify-center bg-[#07090d]/92 backdrop-blur-2xl transition-all duration-700 select-none overflow-hidden`}
    >
      {/* SVG Gooey Filter for genuine liquid glass merging */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="liquid-glass-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 24 -9
              "
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <linearGradient id="portal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none -bottom-20 -right-20 animate-pulse delay-700" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[90px] pointer-events-none -top-10 -left-10 animate-pulse delay-1000" />

      {/* Background Sacred Geometric Mandala */}
      <div className="absolute w-[460px] h-[460px] rounded-full border border-dashed border-amber-500/20 animate-[spin_30s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[540px] h-[540px] rounded-full border border-stone-700/30 animate-[spin_45s_linear_infinite_reverse] pointer-events-none" />

      {/* Main Glassmorphic Portal Capsule */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full mx-4 p-6 sm:p-8 rounded-3xl bg-[#0f141d]/75 border border-white/[0.14] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.25)] backdrop-blur-xl">
        {/* Specular Sheen Sweep Reflection */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rotate-45 pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />

        {/* 1. LIQUID GLASS MERGING METABALLS CONTAINER */}
        <div
          className="relative w-40 h-40 flex items-center justify-center mb-6"
          style={{ filter: "url(#liquid-glass-goo)" }}
        >
          {/* Core Glass Sphere */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/80 via-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-[spin_6s_linear_infinite]" />

          {/* Liquid Glass Orb 1 (Orbiting & Merging) */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_24px_rgba(6,182,212,0.6)] animate-glass-merge-1" />

          {/* Liquid Glass Orb 2 (Orbiting & Merging) */}
          <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tl from-purple-400 to-pink-600 shadow-[0_0_24px_rgba(168,85,247,0.6)] animate-glass-merge-2" />

          {/* Liquid Glass Orb 3 (Pulsing Core) */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-emerald-400 to-amber-500 shadow-[0_0_28px_rgba(16,185,129,0.5)] animate-glass-merge-3" />
        </div>

        {/* High-Refraction Sacred Center Jewel (Overlaid on top of liquid) */}
        <div className="absolute top-[58px] w-14 h-14 rounded-2xl bg-black/40 border border-white/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)] pointer-events-none transform rotate-45">
          <div className="transform -rotate-45 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/karmaraj_emblem.png"
              alt="Karmaraj Rune"
              className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"
            />
          </div>
        </div>

        {/* Title & Brand Tag */}
        <div className="text-center space-y-1 mt-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-black font-title tracking-wider text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
              KARMARAJ
            </h2>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              LIFE RPG
            </span>
          </div>
          <p className="text-xs text-stone-300 font-medium tracking-wide h-5 transition-all duration-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{message || RUNIC_PHRASES[phaseIndex]}</span>
          </p>
        </div>

        {/* Liquid Glass Progress Bar */}
        <div className="w-full mt-6 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-500" />
              <span>ASTRAL MATRIX SYNC</span>
            </span>
            <span className="text-amber-300 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#080b10] p-0.5 border border-white/10 shadow-inner overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 transition-all duration-300 relative shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer light streak passing across bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        </div>

        {/* Tip subtext */}
        <div className="text-[10px] text-stone-500 font-mono mt-4 text-center">
          Transmuting obligations into sacred karma • V2.0
        </div>
      </div>
    </div>
  );
}
