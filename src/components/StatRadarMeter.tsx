"use client";

import React from "react";
import {
  Dumbbell,
  BookOpen,
  Heart,
  Zap,
  MessageSquare,
  Smile,
  Shield,
  Coins,
  Flame,
  Sparkles,
} from "lucide-react";
import { CATEGORY_DETAILS, LevelInfo } from "@/lib/rpgEngine";

interface StatRadarMeterProps {
  stats: {
    strength: number;
    intellect: number;
    vitality: number;
    dexterity: number;
    charisma: number;
    sanity: number;
  };
  levelInfo: LevelInfo;
  gold: number;
  streakCount: number;
}

export default function StatRadarMeter({
  stats,
  levelInfo,
  gold,
  streakCount,
}: StatRadarMeterProps) {
  const statList = [
    { key: "strength", label: "Strength", val: stats.strength, icon: Dumbbell, color: "#ef4444" },
    { key: "intellect", label: "Intellect", val: stats.intellect, icon: BookOpen, color: "#38bdf8" },
    { key: "vitality", label: "Vitality", val: stats.vitality, icon: Heart, color: "#10b981" },
    { key: "dexterity", label: "Dexterity", val: stats.dexterity, icon: Zap, color: "#f59e0b" },
    { key: "charisma", label: "Charisma", val: stats.charisma, icon: MessageSquare, color: "#fbbf24" },
    { key: "sanity", label: "Sanity", val: stats.sanity, icon: Smile, color: "#34d399" },
  ];

  // Maximum value for proportional bar representation
  const maxStat = Math.max(30, ...statList.map((s) => s.val));

  return (
    <div className="rpg-panel border border-slate-800 bg-[#121822] p-5">
      {/* Top Banner: Level and Streak */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="wax-stamp text-xs px-2 py-0.5 border-amber-500 text-amber-400">
              LVL {levelInfo.level}
            </span>
            <span className="text-sm font-bold text-slate-100">{levelInfo.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-md text-xs font-bold text-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{gold} Gold</span>
          </div>

          <div
            className="flex items-center gap-1 bg-orange-950/40 border border-orange-800/40 px-2.5 py-1 rounded-md text-xs font-bold text-orange-400"
            title="Consecutive Days of Heroic Activity"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{streakCount}d Streak</span>
          </div>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Experience Progression
          </span>
          <span className="text-amber-300 font-bold">
            {levelInfo.currentXp} / {levelInfo.xpNeededForNextLevel} XP ({levelInfo.progressPercent}%)
          </span>
        </div>

        {/* Uiverse-style tactile progress bar */}
        <div className="w-full h-3.5 bg-[#0b0e14] rounded-full p-0.5 border border-slate-800 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 relative shadow"
            style={{ width: `${levelInfo.progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Attribute Meters */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Character Attributes</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {statList.map((stat) => {
            const Icon = stat.icon;
            const pct = Math.min(100, Math.round((stat.val / maxStat) * 100));

            return (
              <div
                key={stat.key}
                className="bg-[#0b0e14] border border-slate-800/90 rounded-lg p-2.5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                    {stat.label}
                  </span>
                  <span className="font-bold text-slate-100">{stat.val} PTS</span>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800/80 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
