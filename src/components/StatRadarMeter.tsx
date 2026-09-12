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
  AlertTriangle,
  Axe,
  Wand2,
  Sword,
} from "lucide-react";
import { LevelInfo } from "@/lib/rpgEngine";
import { CHARACTER_CLASSES, CharacterClassType } from "@/lib/classes";
import { soundFx } from "@/lib/audio";

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
  characterClass?: string;
  onOpenClassModal?: () => void;
  decayAlerts?: string[];
}

export default function StatRadarMeter({
  stats,
  levelInfo,
  gold,
  streakCount,
  characterClass = "WARRIOR",
  onOpenClassModal,
  decayAlerts = [],
}: StatRadarMeterProps) {
  const statList = [
    { key: "strength", label: "Strength", val: stats.strength, icon: Dumbbell, color: "#ef4444" },
    { key: "intellect", label: "Intellect", val: stats.intellect, icon: BookOpen, color: "#0284c7" },
    { key: "vitality", label: "Vitality", val: stats.vitality, icon: Heart, color: "#059669" },
    { key: "dexterity", label: "Dexterity", val: stats.dexterity, icon: Zap, color: "#d97706" },
    { key: "charisma", label: "Charisma", val: stats.charisma, icon: MessageSquare, color: "#b45309" },
    { key: "sanity", label: "Sanity", val: stats.sanity, icon: Smile, color: "#10b981" },
  ];

  const maxStat = Math.max(30, ...statList.map((s) => s.val));
  const classKey = (characterClass.toUpperCase() as CharacterClassType) || "WARRIOR";
  const classDef = CHARACTER_CLASSES[classKey] || CHARACTER_CLASSES.WARRIOR;

  function getClassIcon() {
    switch (classKey) {
      case "WARRIOR":
        return <Axe className="w-3.5 h-3.5 text-red-500" />;
      case "MAGE":
        return <Wand2 className="w-3.5 h-3.5 text-sky-500" />;
      case "ROGUE":
        return <Sword className="w-3.5 h-3.5 text-amber-600" />;
      case "PALADIN":
        return <Shield className="w-3.5 h-3.5 text-emerald-600" />;
    }
  }

  // Real SVG Hexagonal Spider Radar Chart
  const radarRadius = 55;
  const rcx = 75;
  const rcy = 75;
  const radarVertices = statList.map((stat, i) => {
    const angle = -Math.PI / 2 + i * ((Math.PI * 2) / 6);
    const ratio = Math.max(0.18, Math.min(1.0, stat.val / maxStat));
    return {
      x: rcx + Math.cos(angle) * radarRadius * ratio,
      y: rcy + Math.sin(angle) * radarRadius * ratio,
      edgeX: rcx + Math.cos(angle) * radarRadius,
      edgeY: rcy + Math.sin(angle) * radarRadius,
      labelX: rcx + Math.cos(angle) * (radarRadius + 14),
      labelY: rcy + Math.sin(angle) * (radarRadius + 14),
      ...stat,
    };
  });
  const polygonPoints = radarVertices.map((v) => `${v.x},${v.y}`).join(" ");
  const concentricRings = [0.33, 0.66, 1.0].map((r) =>
    statList
      .map((_, i) => {
        const angle = -Math.PI / 2 + i * ((Math.PI * 2) / 6);
        return `${rcx + Math.cos(angle) * radarRadius * r},${rcy + Math.sin(angle) * radarRadius * r}`;
      })
      .join(" ")
  );

  return (
    <div className="rpg-panel carved-panel p-5 sm:p-6 flex flex-col justify-between shadow-sm">
      {/* Top Banner: Big Numbers & Distinct Type Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-slate-800 mb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 dark:text-amber-400">
              Adventurer Status
            </span>
            {/* Clickable Class Specialization Badge */}
            {onOpenClassModal && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenClassModal();
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-slate-900 border border-amber-300 dark:border-amber-600/50 text-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
                title="Click to Switch RPG Class Specialization"
              >
                {getClassIcon()}
                <span>{classDef.name}</span>
                <span className="text-amber-700 dark:text-amber-400 text-[9px] font-mono">(Edit)</span>
              </button>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-black font-title text-amber-950 dark:text-amber-300 tracking-tight">
              {levelInfo.title}
            </h2>
          </div>
        </div>

        {/* Primary Metric Badges with Big Numbers */}
        <div className="flex items-center gap-2.5">
          {/* Level Badge */}
          <div className="bg-card border border-amber-400/60 dark:border-amber-500/40 px-3.5 py-1.5 rounded-xl text-center shadow-sm">
            <div className="text-[9px] uppercase font-bold text-stone-500 dark:text-slate-400">Level</div>
            <div className="text-xl font-black text-amber-900 dark:text-amber-400 leading-none">
              {levelInfo.level}
            </div>
          </div>

          {/* Gold Badge */}
          <div className="bg-card border border-amber-600/60 dark:border-amber-700/50 px-3.5 py-1.5 rounded-xl text-center shadow-sm">
            <div className="text-[9px] uppercase font-bold text-stone-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Coins className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>Treasury</span>
            </div>
            <div className="text-xl font-black text-amber-900 dark:text-amber-300 leading-none">
              {gold}g
            </div>
          </div>

          {/* Streak Badge */}
          <div
            className="bg-card border border-orange-500/60 dark:border-orange-700/50 px-3.5 py-1.5 rounded-xl text-center shadow-sm"
            title="Consecutive Days of Activity"
          >
            <div className="text-[9px] uppercase font-bold text-stone-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" />
              <span>Streak</span>
            </div>
            <div className="text-xl font-black text-orange-800 dark:text-orange-400 leading-none">
              {streakCount}d
            </div>
          </div>
        </div>
      </div>

      {/* Active Class Perk Notification Callout */}
      <div className="mb-4 px-3.5 py-2 rounded-lg bg-stone-50 dark:bg-background border border-stone-200 dark:border-slate-800 text-xs flex items-center justify-between shadow-inner">
        <span className="text-stone-700 dark:text-slate-300 flex items-center gap-2 text-[11px]">
          <span className="font-bold text-amber-900 dark:text-amber-300">{classDef.perkTitle}:</span>
          <span className="line-clamp-1">{classDef.perkDescription}</span>
        </span>
      </div>

      {/* Stat Decay Warning (if any stats decayed recently) */}
      {decayAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/50 rounded-xl text-amber-950 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold font-title">Neglect Notice:</span>
            {decayAlerts.map((msg, i) => (
              <p key={i} className="text-[11px] text-amber-900 dark:text-amber-200/90 leading-tight">
                {msg}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Level XP Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-stone-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Experience Progression</span>
          </span>
          <span className="text-amber-900 dark:text-amber-300 font-bold font-mono">
            {levelInfo.currentXp} / {levelInfo.xpNeededForNextLevel} XP ({levelInfo.progressPercent}%)
          </span>
        </div>

        <div className="w-full h-4 bg-stone-200 dark:bg-background rounded-full p-0.5 border border-stone-300 dark:border-slate-700 overflow-hidden shadow-inner relative">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 relative shadow-md xp-shimmer-stripes"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Attribute Meters & Real Spider Radar Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] uppercase tracking-wider font-black text-stone-600 dark:text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
            <span>Character Attributes & Hexagonal Radar</span>
          </h4>
          <span className="text-[10px] text-stone-500 dark:text-slate-400">6 Specialized Stats</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Hexagonal Radar Spider Chart */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50/60 dark:bg-background border border-stone-200 dark:border-slate-800 shadow-inner">
            <svg className="w-36 h-36 select-none" viewBox="0 0 150 150">
              <defs>
                <linearGradient id="miniRadarGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Concentric Rings */}
              {concentricRings.map((ring, idx) => (
                <polygon
                  key={idx}
                  points={ring}
                  fill="transparent"
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray={idx === 2 ? "none" : "2 2"}
                />
              ))}

              {/* Radial Axes */}
              {radarVertices.map((v, idx) => (
                <line
                  key={idx}
                  x1={rcx}
                  y1={rcy}
                  x2={v.edgeX}
                  y2={v.edgeY}
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />
              ))}

              {/* Filled Radar Polygon */}
              <polygon
                points={polygonPoints}
                fill="url(#miniRadarGrad)"
                stroke="#f59e0b"
                strokeWidth="1.8"
                className="transition-all duration-300"
              />

              {/* Vertices */}
              {radarVertices.map((v) => (
                <circle
                  key={v.key}
                  cx={v.x}
                  cy={v.y}
                  r="3"
                  fill={v.color}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            <div className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
              Active Attribute Mesh
            </div>
          </div>

          {/* 6 Attribute Meters */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {statList.map((stat) => {
              const Icon = stat.icon;
              const pct = Math.min(100, Math.round((stat.val / maxStat) * 100));

              return (
                <div
                  key={stat.key}
                  className="bg-stone-50/80 dark:bg-background border border-stone-200 dark:border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5 hover:border-amber-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                  style={{
                    borderLeft: `3px solid ${stat.color}`,
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-800 dark:text-slate-200 font-bold">
                      <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                      {stat.label}
                    </span>
                    <span className="font-mono font-bold text-stone-900 dark:text-slate-100">{stat.val} PTS</span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-200 dark:bg-slate-950 rounded-full border border-stone-300 dark:border-slate-800 overflow-hidden shadow-inner relative">
                    <div
                      className="h-full rounded-full transition-all duration-300 relative"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: stat.color,
                        boxShadow: `0 0 6px ${stat.color}66`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
