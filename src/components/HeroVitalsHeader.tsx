"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BedDouble,
  Sun,
  Users,
  PawPrint,
  ChevronRight,
  Shield,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface HeroVitalsHeaderProps {
  user: {
    id: string;
    username: string;
    level: number;
    xp: number;
    gold: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    isSleeping: boolean;
    characterClass?: string;
    avatar?: string;
    title?: string;
    currentPet?: string | null;
    currentMount?: string | null;
  };
  onToggleInn: () => Promise<void>;
  onOpenClassSelect: () => void;
  onOpenParty: () => void;
  onOpenStable: () => void;
}

export default function HeroVitalsHeader({
  user,
  onToggleInn,
  onOpenClassSelect,
  onOpenParty,
  onOpenStable,
}: HeroVitalsHeaderProps) {
  const [isTogglingInn, setIsTogglingInn] = useState(false);

  const hpPercent = Math.min(100, Math.max(0, (user.hp / (user.maxHp || 50)) * 100));
  const nextLevelXp = user.level * 100;
  const currentLevelProgress = user.xp % nextLevelXp;
  const xpPercent = Math.min(100, Math.max(0, (currentLevelProgress / nextLevelXp) * 100));
  const mpPercent = Math.min(100, Math.max(0, (user.mp / (user.maxMp || 50)) * 100));

  const handleInnClick = async () => {
    try {
      setIsTogglingInn(true);
      soundFx.playClick();
      await onToggleInn();
    } finally {
      setIsTogglingInn(false);
    }
  };

  const charClass = (user.characterClass || "WARRIOR").toUpperCase();

  return (
    // Outer Shell (Double-Bezel)
    <div className="w-full p-1.5 rounded-[1.75rem] bg-gradient-to-b from-white/10 via-white/5 to-white/0 shadow-2xl ring-1 ring-white/15 mb-6 relative overflow-hidden">
      {/* Tavern Rest ambient glow */}
      {user.isSleeping && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-amber-950/40 pointer-events-none rounded-[1.75rem] border border-amber-500/30 animate-pulse" />
      )}

      {/* Inner Core */}
      <div className="relative w-full p-4 sm:p-5 rounded-[calc(1.75rem-0.375rem)] bg-[#0d1117]/95 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 relative z-10">
          {/* Left Side: Character Avatar & Vitals Bars */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Avatar Machine */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 border border-white/15 p-1 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full bg-neutral-950 rounded-xl flex items-center justify-center text-3xl select-none group-hover:scale-105 transition-transform">
                  {charClass === "MAGE" && "🧙"}
                  {charClass === "ROGUE" && "🥷"}
                  {charClass === "PALADIN" && "🛡️"}
                  {charClass === "WARRIOR" && "⚔️"}
                </div>

                {/* Inn sleeping overlay */}
                {user.isSleeping && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="text-xl animate-bounce">💤</span>
                  </div>
                )}
              </div>

              {/* Level Badge */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-[11px] font-black px-2 py-0.5 rounded-md border border-amber-300 shadow-md">
                LVL {user.level}
              </div>
            </div>

            {/* User Bio & 3 Vitals Bars */}
            <div className="flex-1 w-full space-y-2.5">
              {/* User Details Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white tracking-tight">
                    {user.username}
                  </span>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onOpenClassSelect();
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-amber-400 border border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all flex items-center gap-1 active:scale-95"
                    title="Change hero archetype"
                  >
                    <Shield className="w-3 h-3 text-amber-400" />
                    {charClass}
                  </button>
                  {user.isSleeping && (
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <BedDouble className="w-3 h-3" /> Resting in Tavern
                    </span>
                  )}
                </div>

                {/* Currency, Pet & Mount Chips */}
                <div className="flex items-center gap-2">
                  {/* Gold Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-sm">
                    <Image
                      src="/icons/rpg/gold.svg"
                      alt="Gold"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    <span>{user.gold}</span>
                  </div>

                  {/* Stable / Companion Pill */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onOpenStable();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs font-semibold transition-all active:scale-95 hover:bg-emerald-500/10"
                    title="Manage Pet & Mount Stable"
                  >
                    <PawPrint className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {user.currentPet
                        ? user.currentPet.replace("drop_", "").replace("_", " ")
                        : "Sanctuary"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Vitals Progress Bars: HP, EXP, MP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                {/* Health (HP) Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-neutral-300">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <Image
                        src="/icons/rpg/health.svg"
                        alt="Health"
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5"
                      />
                      Health
                    </span>
                    <span className="font-mono text-[10px]">
                      {user.hp} / {user.maxHp || 50}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Experience (EXP) Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-neutral-300">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Image
                        src="/icons/rpg/experience.svg"
                        alt="Experience"
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5"
                      />
                      Experience
                    </span>
                    <span className="font-mono text-[10px]">
                      {currentLevelProgress} / {nextLevelXp}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Mana (MP) Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-neutral-300">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <Image
                        src="/icons/rpg/mana.svg"
                        alt="Mana"
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5"
                      />
                      Mana
                    </span>
                    <span className="font-mono text-[10px]">
                      {user.mp} / {user.maxMp || 50}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                      style={{ width: `${mpPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Tavern Rest & Party Banner */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-2.5 flex-shrink-0">
            {/* Inn Vacation Button */}
            <button
              onClick={handleInnClick}
              disabled={isTogglingInn}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-sm active:scale-95 ${
                user.isSleeping
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {user.isSleeping ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Resume Questing</span>
                </>
              ) : (
                <>
                  <BedDouble className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Rest in Tavern</span>
                </>
              )}
            </button>

            {/* Party CTA Banner */}
            <div
              onClick={() => {
                soundFx.playClick();
                onOpenParty();
              }}
              className="cursor-pointer group flex items-center justify-between gap-3 px-3 py-2 bg-gradient-to-r from-neutral-900 to-neutral-950 hover:from-neutral-850 hover:to-neutral-900 border border-white/10 hover:border-amber-400/50 rounded-xl transition-all shadow-md active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-neutral-200 group-hover:text-amber-300 transition-colors">
                    Guild Party Raids
                  </div>
                  <div className="text-[10px] text-neutral-400 line-clamp-1">
                    Battle boss monsters together
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
