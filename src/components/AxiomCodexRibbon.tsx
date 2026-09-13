"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Copy, Check } from "lucide-react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

interface AxiomItem {
  id: number;
  quote: string;
  source: string;
  category: string;
}

const CODEX_AXIOMS: AxiomItem[] = [
  {
    id: 1,
    quote: "The dark is not empty; it holds the lost axioms of forgotten kings.",
    source: "Ancient Ashen Codex",
    category: "MYSTICISM",
  },
  {
    id: 2,
    quote: "Dharmo rakshati rakshitah — Dharma protected, protects the protector.",
    source: "Manusmriti 8.15",
    category: "DHARMA",
  },
  {
    id: 3,
    quote: "You have a right to perform your prescribed duties, but are never entitled to the fruits of actions.",
    source: "Bhagavad Gita 2.47",
    category: "KARMA YOGA",
  },
  {
    id: 4,
    quote: "Calmness of mind is the supreme weapon in the heat of daily battles.",
    source: "Mahabharata, Shanti Parva",
    category: "MASTERY",
  },
  {
    id: 5,
    quote: "The mind is everything; what you continuously think and focus upon, you become.",
    source: "Dhammapada",
    category: "FOCUS",
  },
  {
    id: 6,
    quote: "Perform all work skillfully as devotion, casting away selfish attachment and remaining balanced in success and failure.",
    source: "Bhagavad Gita 2.48",
    category: "DISCIPLINE",
  },
  {
    id: 7,
    quote: "One who has conquered their own unruly mind has already reached tranquility and supreme liberation.",
    source: "Bhagavad Gita 6.7",
    category: "SANITY",
  },
  {
    id: 8,
    quote: "Energy flows where unbroken attention goes; guard your sacred minutes like celestial gold.",
    source: "Vedic Runic Maxim",
    category: "CHRONO",
  },
];

export default function AxiomCodexRibbon() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const currentAxiom = CODEX_AXIOMS[currentIndex];

  const handleNext = () => {
    soundFx.playClick();
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % CODEX_AXIOMS.length);
      setIsFading(false);
    }, 150);
  };

  const handlePrev = () => {
    soundFx.playClick();
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + CODEX_AXIOMS.length) % CODEX_AXIOMS.length);
      setIsFading(false);
    }, 150);
  };

  const handleContemplate = () => {
    soundFx.playLevelUp();
    spawnCombatText("🧘 CODEX AXIOM CONTEMPLATED • +5 FOCUS", "mana");
  };

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(`"${currentAxiom.quote}" — ${currentAxiom.source}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full relative group">
      {/* Outer ambient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-500 pointer-events-none" />

      {/* Main Inscription Box */}
      <div className="relative w-full rounded-2xl bg-[#0d1117]/90 border border-stone-800/90 hover:border-amber-500/40 p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all duration-300">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Left: Mandala Runic Sigil Box */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleContemplate}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-amber-500/15 to-stone-900 border border-amber-500/40 hover:border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 transition-all flex-shrink-0 group/sigil"
              title="Click to Contemplate Inscription (+Focus)"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover/sigil:rotate-12 transition-transform" />
            </button>

            {/* Inscription Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-amber-400/90 font-bold uppercase flex items-center gap-1.5">
                  <span>ANCIENT CODEX</span>
                  <span className="text-stone-600">•</span>
                  <span className="text-stone-400">DAILY AXIOM</span>
                </span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300 border border-stone-700/60 uppercase">
                  {currentAxiom.category}
                </span>
              </div>

              <div
                className={`transition-opacity duration-150 ${
                  isFading ? "opacity-0 translate-y-0.5" : "opacity-100 translate-y-0"
                }`}
              >
                <p className="text-xs sm:text-sm text-stone-200 font-serif italic tracking-wide leading-snug line-clamp-2 sm:line-clamp-1">
                  &ldquo;{currentAxiom.quote}&rdquo;
                </p>
                <span className="text-[10px] text-stone-500 font-mono">
                  — {currentAxiom.source}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Carousel Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
              title="Copy Inscription"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-300 transition-colors hover:scale-105 active:scale-95"
              title="Previous Axiom"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Counter pill */}
            <span className="text-[10px] font-mono font-bold text-stone-400 px-2 py-1 bg-stone-900/60 rounded-md border border-stone-800">
              {currentIndex + 1} / {CODEX_AXIOMS.length}
            </span>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-300 transition-colors hover:scale-105 active:scale-95"
              title="Next Axiom"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
