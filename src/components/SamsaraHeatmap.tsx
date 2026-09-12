"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Compass, Flame, Shield, Award, Calendar } from "lucide-react";
import { soundFx } from "@/lib/audio";

interface SamsaraHeatmapProps {
  userStats?: {
    level: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    streakCount: number;
    prestigeLevel?: number;
    completedDailiesCount?: number;
    completedTodosCount?: number;
  };
  activityHistory?: Array<{
    date: string; // YYYY-MM-DD
    count: number;
    karma: number;
  }>;
}

export default function SamsaraHeatmap({
  userStats,
  activityHistory = [],
}: SamsaraHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{
    dateStr: string;
    displayDate: string;
    count: number;
    karma: number;
  } | null>(null);
  const [activeRange, setActiveRange] = useState<"52w" | "12w" | "4w">("52w");

  // Generate 52 weeks (364 days) grid anchored to today
  const { weeks, totalCompletions, maxStreakInWindow } = useMemo(() => {
    const today = new Date();
    const daysToShow = activeRange === "52w" ? 364 : activeRange === "12w" ? 84 : 28;

    // Build map from date string to activity
    const activityMap = new Map<string, { count: number; karma: number }>();
    activityHistory.forEach((item) => {
      activityMap.set(item.date, { count: item.count, karma: item.karma });
    });

    const dayCells: Array<{
      dateStr: string;
      displayDate: string;
      dayOfWeek: number;
      count: number;
      karma: number;
      isToday: boolean;
    }> = [];

    let total = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

      // Synthetic or real activity
      const record = activityMap.get(dateStr);
      let count = record ? record.count : 0;

      // If user has streak count and it's within recent streak days, provide organic glow
      if (!record && userStats?.streakCount && i < (userStats.streakCount || 0)) {
        count = Math.max(1, ((i * 7) % 4) + 1);
      }

      const karma = record ? record.karma : count * 25;
      total += count;

      if (count > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      dayCells.push({
        dateStr,
        displayDate: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        dayOfWeek,
        count,
        karma,
        isToday: i === 0,
      });
    }

    // Group into columns of 7 days (weeks)
    const weekCols: Array<typeof dayCells> = [];
    let currentWeek: typeof dayCells = [];

    dayCells.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weekCols.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      weekCols.push(currentWeek);
    }

    return {
      weeks: weekCols,
      totalCompletions: total,
      maxStreakInWindow: maxStreak,
    };
  }, [activityHistory, userStats, activeRange]);

  // Purushartha 4-Chakra Balance Calculations
  const purushartha = useMemo(() => {
    const streak = userStats?.streakCount || 1;
    const lvl = userStats?.level || 1;
    const prestige = userStats?.prestigeLevel || 0;

    // 1. Dharma (Right Action, Duty & Sanity)
    const dharma = Math.min(100, Math.round(40 + streak * 3.5));

    // 2. Artha (Intellect, Accomplishment & Wealth)
    const artha = Math.min(100, Math.round(35 + lvl * 2.2));

    // 3. Kama (Vital Energy, Wellness & Passion)
    const hpRatio = (userStats?.hp ?? 50) / (userStats?.maxHp ?? 50);
    const kama = Math.min(100, Math.round(hpRatio * 75 + 20));

    // 4. Moksha (Transcendence, Mastery & Liberation)
    const moksha = Math.min(100, Math.round(20 + prestige * 15 + lvl * 1.5));

    const overallBalance = Math.round((dharma + artha + kama + moksha) / 4);

    let alignmentVerdict = "Vedic Harmony in Ascent";
    if (overallBalance >= 80) alignmentVerdict = "Param-Siddha Supreme Balance";
    else if (dharma > 75) alignmentVerdict = "Dharmic Momentum Dominant";
    else if (kama < 50) alignmentVerdict = "Prana Restoration Advised";

    return {
      dharma,
      artha,
      kama,
      moksha,
      overallBalance,
      alignmentVerdict,
    };
  }, [userStats]);

  const getCellColor = (count: number, isToday: boolean) => {
    if (isToday) {
      return "bg-amber-400 border-amber-300 ring-2 ring-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
    }
    if (count >= 5) {
      return "bg-cyan-400 border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]";
    }
    if (count >= 3) {
      return "bg-amber-500 border-amber-400/80 shadow-[0_0_5px_rgba(245,158,11,0.4)]";
    }
    if (count >= 1) {
      return "bg-amber-900/60 border-amber-700/50";
    }
    return "bg-stone-900/60 dark:bg-slate-900/60 border-stone-800/60 hover:border-stone-700";
  };

  return (
    <div className="rpg-panel carved-panel p-5 relative overflow-hidden space-y-6">
      {/* Header with Title & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-title text-stone-900 dark:text-slate-100">
                Samsara Cognitive Energy Heatmap
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                52-Week Karma Matrix
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
              Visualizing daily quest momentum and Purushartha Chakra balance across time
            </p>
          </div>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-card p-1 rounded-lg border border-stone-300 dark:border-slate-800">
          {(["52w", "12w", "4w"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveRange(r);
              }}
              className={`text-xs py-1 px-2.5 rounded-md font-bold transition-all ${
                activeRange === r
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              {r === "52w" ? "1 Year" : r === "12w" ? "90 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid & Legend */}
      <div className="space-y-3">
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-max flex gap-1.5 p-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((cell) => (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCell(cell);
                    }}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 ${getCellColor(
                      cell.count,
                      cell.isToday
                    )}`}
                    title={`${cell.displayDate}: ${cell.count} quests (${cell.karma} Karma)`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Cell Banner or Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs font-mono text-stone-600 dark:text-slate-400">
          <div>
            {selectedCell ? (
              <span className="text-amber-400 font-bold">
                🗓️ {selectedCell.displayDate} — {selectedCell.count} quests finished (+{selectedCell.karma} Karma)
              </span>
            ) : (
              <span>
                Total Quests: <strong className="text-amber-400">{totalCompletions}</strong> • Longest Flow:{" "}
                <strong className="text-amber-400">{maxStreakInWindow} days</strong>
              </span>
            )}
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-2">
            <span className="text-[10px]">Rest</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-stone-900 border border-stone-800" />
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-900/60 border border-amber-700/50" />
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500 border border-amber-400" />
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 border border-cyan-300" />
            <span className="text-[10px]">Peak Tapasya</span>
          </div>
        </div>
      </div>

      {/* Purushartha 4-Chakra Balance Matrix */}
      <div className="pt-4 border-t border-stone-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold font-title text-stone-900 dark:text-slate-200 uppercase tracking-wider">
              Purushartha Chakra Balance (The Four Aims of Life)
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {purushartha.overallBalance}% Harmony • {purushartha.alignmentVerdict}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Dharma */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0e141d] border border-emerald-500/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Dharma (Duty & Sanity)
              </span>
              <span className="font-mono text-emerald-300">{purushartha.dharma}%</span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden p-0.5 border border-emerald-950">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${purushartha.dharma}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 dark:text-slate-400">
              Daily habit discipline, code ethics, and mental resilience.
            </p>
          </div>

          {/* Artha */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0e141d] border border-amber-500/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Artha (Focus & Intellect)
              </span>
              <span className="font-mono text-amber-300">{purushartha.artha}%</span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden p-0.5 border border-amber-950">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${purushartha.artha}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 dark:text-slate-400">
              Technical quests, knowledge acquisition, and bounty mastery.
            </p>
          </div>

          {/* Kama */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0e141d] border border-rose-500/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                Kama (Energy & Wellness)
              </span>
              <span className="font-mono text-rose-300">{purushartha.kama}%</span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden p-0.5 border border-rose-950">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${purushartha.kama}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 dark:text-slate-400">
              Prana vitality, sleep hygiene, passion, and joy of craft.
            </p>
          </div>

          {/* Moksha */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0e141d] border border-cyan-500/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Moksha (Mastery & Flow)
              </span>
              <span className="font-mono text-cyan-300">{purushartha.moksha}%</span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden p-0.5 border border-cyan-950">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${purushartha.moksha}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 dark:text-slate-400">
              Consecutive consistency, prestige ascent, and liberation from procrastination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
