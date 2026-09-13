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
  Flame,
  Sparkles,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { CharacterClassType } from "@/lib/classes";

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
  onClassSelected?: (newClass: CharacterClassType) => void;
}

export default function HeroVitalsHeader({
  user,
  onToggleInn,
  onOpenClassSelect,
  onOpenParty,
  onOpenStable,
  onClassSelected,
}: HeroVitalsHeaderProps) {
  const [isTogglingInn, setIsTogglingInn] = useState(false);

  const safeMaxHp = Math.max(1, user.maxHp || 50);
  const hpPercent = Math.min(100, Math.max(0, ((user.hp ?? 0) / safeMaxHp) * 100));
  const safeLevel = Math.max(1, user.level || 1);
  const nextLevelXp = safeLevel * 100;
  const currentLevelProgress = (user.xp || 0) % nextLevelXp;
  const xpPercent = Math.min(100, Math.max(0, (currentLevelProgress / nextLevelXp) * 100));
  const safeMaxMp = Math.max(1, user.maxMp || 50);
  const mpPercent = Math.min(100, Math.max(0, ((user.mp ?? 0) / safeMaxMp) * 100));

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
  const [switchingClass, setSwitchingClass] = useState(false);

  const CLASS_META: Record<
    string,
    { title: string; weapon: string; primaryStat: string; icon: string; short: string }
  > = {
    WARRIOR: {
      title: "SOLAR BERSERKER",
      weapon: "Gada of Thunder",
      primaryStat: "STRENGTH",
      icon: "⚔️",
      short: "KNIGHT",
    },
    MAGE: {
      title: "SHADOW SORCERER",
      weapon: "Eye of the Void Staff",
      primaryStat: "INTELLIGENCE",
      icon: "🧙",
      short: "SORC.",
    },
    ROGUE: {
      title: "ASTRAL RONIN",
      weapon: "Dual Void Chakrams",
      primaryStat: "DEXTERITY",
      icon: "🥷",
      short: "RONIN",
    },
    PALADIN: {
      title: "DHARMA PALADIN",
      weapon: "Kavacha Aegis",
      primaryStat: "VITALITY",
      icon: "🛡️",
      short: "ROGUE",
    },
  };

  const currentClassMeta = CLASS_META[charClass] || CLASS_META.WARRIOR;

  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? "GOOD MORNING,"
      : currentHour < 17
      ? "GOOD AFTERNOON,"
      : "GOOD EVENING,";

  const handleQuickClassSwitch = async (targetClass: CharacterClassType) => {
    if (targetClass === charClass || switchingClass) return;
    setSwitchingClass(true);
    soundFx.playLevelUp();
    try {
      const res = await fetch("/api/user/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterClass: targetClass }),
      });
      if (res.ok) {
        onClassSelected?.(targetClass);
      }
    } catch (err) {
      console.error("Quick class switch error:", err);
    } finally {
      setSwitchingClass(false);
    }
  };

  return (
    // Outer Shell (Double-Bezel)
    <div className="w-full p-1.5 rounded-[1.75rem] bg-gradient-to-b from-white/10 via-white/5 to-white/0 shadow-2xl ring-1 ring-white/15 mb-6 relative overflow-hidden">
      {/* Tavern Rest ambient glow */}
      {user.isSleeping && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-amber-950/40 pointer-events-none rounded-[1.75rem] border border-amber-500/30 animate-pulse" />
      )}

      {/* Inner Core */}
      <div className="relative w-full p-4 sm:p-5 rounded-[calc(1.75rem-0.375rem)] bg-[#0d1117]/95 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {/* Grand Champion Honorific & Archetype Switcher Bar */}
        <div className="pb-3.5 mb-3.5 border-b border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-stone-400 font-bold mb-0.5 flex items-center gap-1.5">
              <span>{timeGreeting}</span>
              <span className="text-amber-500/70">—</span>
              <span className="text-amber-400/90">CHOSEN CHAMPION</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-title tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                {currentClassMeta.title}
              </h2>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border border-amber-300 shadow-sm">
                LVL {user.level}
              </span>
            </div>

            <div className="text-[11px] text-stone-400 font-mono mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-stone-300">ACOLYTE OF DHARMA</span>
              <span className="text-stone-600">•</span>
              <span className="text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-bold">
                {currentClassMeta.primaryStat} (+{user.level * 2 + 10})
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-300">{currentClassMeta.weapon}</span>
            </div>
          </div>

          {/* Quick Archetype Switcher Pills */}
          <div className="flex flex-col items-start md:items-end gap-1 flex-shrink-0">
            <div className="text-[9px] font-mono tracking-wider uppercase text-stone-400 font-bold">
              ARCHETYPE
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
              {(["WARRIOR", "MAGE", "ROGUE", "PALADIN"] as CharacterClassType[]).map((cls) => {
                const isActive = charClass === cls;
                const meta = CLASS_META[cls];
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleQuickClassSwitch(cls)}
                    disabled={switchingClass}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wide transition-all flex items-center gap-1 active:scale-95 ${
                      isActive
                        ? "bg-amber-500/20 border border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                        : "text-stone-400 hover:text-stone-200 border border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                    title={`Switch to ${meta.title}`}
                  >
                    <span>{meta.icon}</span>
                    <span>{cls.slice(0, 4)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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
                      <Flame className="w-3 h-3 text-orange-400" /> Resting at Bonfire
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
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rest at Bonfire</span>
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
