"use client";

import React, { useEffect } from "react";
import { Sparkles, Check } from "lucide-react";
import { MysteryDropItem } from "@/lib/taskEngine";
import { soundFx } from "@/lib/audio";

interface LootDropModalProps {
  drop: MysteryDropItem | null;
  onClose: () => void;
}

export default function LootDropModal({ drop, onClose }: LootDropModalProps) {
  useEffect(() => {
    if (drop) {
      soundFx.playLootDrop();
    }
  }, [drop]);

  if (!drop) return null;

  const rarityStyles: Record<string, { ring: string; text: string; bg: string; badge: string }> = {
    COMMON: {
      ring: "ring-emerald-500/30 shadow-emerald-500/10",
      text: "text-emerald-400",
      bg: "from-emerald-950/40 via-black to-emerald-950/20",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    UNCOMMON: {
      ring: "ring-sky-500/30 shadow-sky-500/10",
      text: "text-sky-400",
      bg: "from-sky-950/40 via-black to-sky-950/20",
      badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    },
    RARE: {
      ring: "ring-purple-500/40 shadow-purple-500/20",
      text: "text-purple-300",
      bg: "from-purple-950/50 via-black to-purple-950/20",
      badge: "bg-purple-500/20 text-purple-200 border-purple-500/40",
    },
    LEGENDARY: {
      ring: "ring-amber-500/50 shadow-amber-500/25",
      text: "text-amber-300",
      bg: "from-amber-950/50 via-black to-amber-950/30",
      badge: "bg-amber-500/20 text-amber-200 border-amber-500/50 animate-pulse",
    },
  };

  const currentRarity = rarityStyles[drop.rarity] || rarityStyles.COMMON;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Outer Shell (Double-Bezel) */}
      <div className="relative w-full max-w-md p-1.5 rounded-[2rem] bg-gradient-to-b from-white/10 via-white/5 to-white/0 shadow-2xl ring-1 ring-white/15">
        {/* Inner Core */}
        <div
          className={`relative w-full p-6 md:p-8 rounded-[calc(2rem-0.375rem)] bg-gradient-to-b ${currentRarity.bg} border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col items-center text-center overflow-hidden`}
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

          {/* Eyebrow badge */}
          <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-wider text-amber-300">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            <span>MYSTERY LOOT DISCOVERED</span>
          </div>

          {/* Item Icon Vessel */}
          <div
            className={`w-24 h-24 my-2 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-center text-5xl shadow-lg ring-2 ${currentRarity.ring}`}
          >
            {drop.icon}
          </div>

          {/* Rarity Pill */}
          <span
            className={`mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${currentRarity.badge}`}
          >
            {drop.rarity} {drop.type}
          </span>

          {/* Item Name */}
          <h2 className="mt-3 text-2xl font-bold text-white tracking-tight">
            {drop.name}
          </h2>

          {/* Description */}
          <p className="mt-2 text-sm text-neutral-300 leading-relaxed max-w-xs">
            {drop.description}
          </p>

          {/* Claim Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="group mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Claim Spoils</span>
            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <Check className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
