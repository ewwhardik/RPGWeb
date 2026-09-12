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
import { LevelInfo } from "@/lib/rpgEngine";

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

  const maxStat = Math.max(30, ...statList.map((s) => s.val));

  return (
    <div className="rpg-panel carved-panel p-5 sm:p-6 flex flex-col justify-between">
      {/* Top Banner: Big Numbers & Distinct Type Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/80">
            Adventurer Status
          </span>
          <div className="flex items-baseline gap-3 mt-0.5">
            <h2 className="text-2xl sm:text-3xl font-bold font-title text-amber-300">
              {levelInfo.title}
            </h2>
          </div>
        </div>

        {/* Primary Metric Badges with Big Numbers */}
        <div className="flex items-center gap-2.5">
          {/* Level Badge */}
          <div className="bg-[#0b0e14] border border-amber-500/40 px-3.5 py-1.5 rounded-lg text-center shadow-inner">
            <div className="text-[9px] uppercase font-bold text-slate-400">Level</div>
            <div className="text-xl font-black text-amber-400 leading-none">
              {levelInfo.level}
            </div>
          </div>

          {/* Gold Badge */}
          <div className="bg-[#0b0e14] border border-amber-700/50 px-3.5 py-1.5 rounded-lg text-center shadow-inner">
            <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Coins className="w-2.5 h-2.5 text-amber-400" />
              <span>Treasury</span>
            </div>
            <div className="text-xl font-black text-amber-300 leading-none">
              {gold}g
            </div>
          </div>

          {/* Streak Badge */}
          <div
            className="bg-[#0b0e14] border border-orange-700/50 px-3.5 py-1.5 rounded-lg text-center shadow-inner"
            title="Consecutive Days of Activity"
          >
            <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-2.5 h-2.5 text-orange-400" />
              <span>Streak</span>
            </div>
            <div className="text-xl font-black text-orange-400 leading-none">
              {streakCount}d
            </div>
          </div>
        </div>
      </div>

      {/* Level XP Progress Bar with Animated Diagonal Shimmer Stripes */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Experience Progression</span>
          </span>
          <span className="text-amber-300 font-bold">
            {levelInfo.currentXp} / {levelInfo.xpNeededForNextLevel} XP ({levelInfo.progressPercent}%)
          </span>
        </div>

        {/* Textured XP progress meter with animated stripes */}
        <div className="w-full h-4 bg-[#0b0e14] rounded-full p-0.5 border border-slate-700/80 overflow-hidden shadow-inner relative">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 relative shadow-md xp-shimmer-stripes"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Attribute Meters with Stamina Tick Marks & Colored Glow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Character Attributes (Stamina Meters)</span>
          </h4>
          <span className="text-[10px] text-slate-500">6 Specialized Stats</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statList.map((stat) => {
            const Icon = stat.icon;
            const pct = Math.min(100, Math.round((stat.val / maxStat) * 100));

            return (
              <div
                key={stat.key}
                className="bg-[#0b0e14] border border-slate-800/90 rounded-lg p-2.5 flex flex-col gap-1.5 hover:border-slate-700 transition-colors"
                style={{
                  borderLeft: `3px solid ${stat.color}`,
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                    {stat.label}
                  </span>
                  <span className="font-mono font-bold text-slate-100">{stat.val} PTS</span>
                </div>

                {/* Segmented Stamina Meter */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-800/90 overflow-hidden shadow-inner relative">
                  <div
                    className="h-full rounded-full transition-all duration-300 relative"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: stat.color,
                      boxShadow: `0 0 8px ${stat.color}66`,
                    }}
                  />
                  {/* Segmented Tick Marks Overlay */}
                  <div className="stamina-meter-ticks" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
