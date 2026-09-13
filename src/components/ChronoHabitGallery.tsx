"use client";

import React, { useState } from "react";
import {
  Check,
  Plus,
  AlertTriangle,
  Gift,
  Sparkles,
  Coins,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

export interface ChronoHabitCardItem {
  id: string;
  title: string;
  type: "GOOD" | "BAD";
  xpValue: number;
  goldValue?: number;
  coverImage: string;
  category: string;
  completedToday?: boolean;
  strikeCount?: number;
}

export interface ChronoRewardCardItem {
  id: string;
  title: string;
  xpCost: number;
  goldCost: number;
  coverImage: string;
  claimedCount?: number;
}

interface ChronoHabitGalleryProps {
  userGold: number;
  userXp: number;
  onScoreTask: (taskId: string, direction: "up" | "down") => Promise<void>;
  onBuyReward: (rewardId: string, cost: number) => Promise<void>;
  onOpenNewTaskModal: (defaultType: "HABIT" | "REWARD") => void;
}

// Built-in curated Pixel Art card covers
export const DEFAULT_GOOD_HABITS: ChronoHabitCardItem[] = [
  {
    id: "gh-deep-work",
    title: "Deep Work",
    type: "GOOD",
    xpValue: 40,
    goldValue: 25,
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
    category: "INTELLECT",
    completedToday: false,
  },
  {
    id: "gh-workout",
    title: "Workout",
    type: "GOOD",
    xpValue: 20,
    goldValue: 15,
    coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    category: "STRENGTH",
    completedToday: false,
  },
  {
    id: "gh-healthy-diet",
    title: "Healthy Diet",
    type: "GOOD",
    xpValue: 10,
    goldValue: 10,
    coverImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop",
    category: "VITALITY",
    completedToday: false,
  },
  {
    id: "gh-reading",
    title: "Reading",
    type: "GOOD",
    xpValue: 10,
    goldValue: 10,
    coverImage: "https://images.unsplash.com/photo-1507842229451-79b1be886a27?q=80&w=600&auto=format&fit=crop",
    category: "INTELLECT",
    completedToday: false,
  },
  {
    id: "gh-good-sleep",
    title: "Good Sleep",
    type: "GOOD",
    xpValue: 10,
    goldValue: 10,
    coverImage: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=600&auto=format&fit=crop",
    category: "SANITY",
    completedToday: false,
  },
  {
    id: "gh-journaling",
    title: "Journaling",
    type: "GOOD",
    xpValue: 10,
    goldValue: 10,
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=600&auto=format&fit=crop",
    category: "SANITY",
    completedToday: false,
  },
];

export const DEFAULT_BAD_HABITS: ChronoHabitCardItem[] = [
  {
    id: "bh-alcohol",
    title: "Alcohol",
    type: "BAD",
    xpValue: 20,
    coverImage: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop",
    category: "VITALITY",
    strikeCount: 0,
  },
  {
    id: "bh-smoking",
    title: "Smoking",
    type: "BAD",
    xpValue: 20,
    coverImage: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop",
    category: "VITALITY",
    strikeCount: 0,
  },
  {
    id: "bh-screen-time",
    title: "High Screen Time",
    type: "BAD",
    xpValue: 20,
    coverImage: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop",
    category: "SANITY",
    strikeCount: 0,
  },
  {
    id: "bh-fast-food",
    title: "Fast Food",
    type: "BAD",
    xpValue: 20,
    coverImage: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=600&auto=format&fit=crop",
    category: "VITALITY",
    strikeCount: 0,
  },
  {
    id: "bh-bad-sleep",
    title: "Bad Sleep",
    type: "BAD",
    xpValue: 20,
    coverImage: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=600&auto=format&fit=crop",
    category: "SANITY",
    strikeCount: 0,
  },
];

export const DEFAULT_CHRONO_REWARDS: ChronoRewardCardItem[] = [
  {
    id: "rew-walk",
    title: "Go for a walk",
    xpCost: 50,
    goldCost: 25,
    coverImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "rew-movie",
    title: "Watch movie",
    xpCost: 100,
    goldCost: 50,
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "rew-eat-out",
    title: "Eat outside",
    xpCost: 500,
    goldCost: 150,
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "rew-day-off",
    title: "Day off",
    xpCost: 1000,
    goldCost: 350,
    coverImage: "https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "rew-vacation",
    title: "Vacation",
    xpCost: 5000,
    goldCost: 1000,
    coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
  },
];

export default function ChronoHabitGallery({
  userGold,
  userXp,
  onScoreTask,
  onBuyReward,
  onOpenNewTaskModal,
}: ChronoHabitGalleryProps) {
  const [goodHabits, setGoodHabits] = useState<ChronoHabitCardItem[]>(DEFAULT_GOOD_HABITS);
  const [badHabits, setBadHabits] = useState<ChronoHabitCardItem[]>(DEFAULT_BAD_HABITS);
  const [rewards] = useState<ChronoRewardCardItem[]>(DEFAULT_CHRONO_REWARDS);

  // Active sub-views
  const [goodHabitTab, setGoodHabitTab] = useState<"ALL" | "DONE" | "OVERVIEW">("ALL");
  const [badHabitTab, setBadHabitTab] = useState<"ALL" | "DONE" | "OVERVIEW">("ALL");
  const [rewardTab, setRewardTab] = useState<"ALL" | "CLAIMED">("ALL");

  // Toggle completion of Good Habit
  const handleToggleGoodHabit = async (habit: ChronoHabitCardItem) => {
    soundFx.playHabitPlus();
    const willBeCompleted = !habit.completedToday;

    setGoodHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? { ...h, completedToday: willBeCompleted } : h))
    );

    if (willBeCompleted) {
      spawnCombatText(`+${habit.xpValue} XP • ${habit.title}!`, "crit");
      await onScoreTask(habit.id, "up");
    }
  };

  // Trigger Bad Habit slip-up
  const handleTriggerBadHabit = async (habit: ChronoHabitCardItem) => {
    soundFx.playHabitMinus();
    setBadHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? { ...h, strikeCount: (h.strikeCount || 0) + 1 } : h))
    );
    spawnCombatText(`-${habit.xpValue} XP • Relapse Penalized!`, "damage");
    await onScoreTask(habit.id, "down");
  };

  // Claim Reward
  const handleClaimReward = async (reward: ChronoRewardCardItem) => {
    if (userGold < reward.goldCost && userXp < reward.xpCost) {
      soundFx.play("faint");
      spawnCombatText(`Need ${reward.goldCost} Gold or ${reward.xpCost} XP!`, "damage");
      return;
    }

    soundFx.playRewardBuy();
    spawnCombatText(`🎉 CLAIMED: ${reward.title}!`, "crit");
    await onBuyReward(reward.id, reward.goldCost);
  };

  const filteredGoodHabits = goodHabits.filter((h) => {
    if (goodHabitTab === "DONE") return h.completedToday;
    return true;
  });

  const filteredBadHabits = badHabits.filter((h) => {
    if (badHabitTab === "DONE") return (h.strikeCount || 0) > 0;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Daily Sacred Rituals Gallery */}
      <div className="bg-[#0e1217] border border-stone-800/90 rounded-2xl p-5 shadow-2xl relative">
        {/* Header with Title & Views */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <h3 className="text-sm sm:text-base font-black font-title tracking-wider text-stone-100 uppercase">
              Sacred Rituals
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setGoodHabitTab("ALL")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                goodHabitTab === "ALL"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              All Rituals
            </button>
            <button
              type="button"
              onClick={() => setGoodHabitTab("DONE")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                goodHabitTab === "DONE"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Rituals Completed Today
            </button>
            <button
              type="button"
              onClick={() => setGoodHabitTab("OVERVIEW")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                goodHabitTab === "OVERVIEW"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Overview
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredGoodHabits.map((habit) => {
            const isDone = habit.completedToday;
            return (
              <div
                key={habit.id}
                className={`group bg-[#141922] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md ${
                  isDone
                    ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                    : "border-stone-800 hover:border-amber-500/40 hover:-translate-y-0.5"
                }`}
              >
                {/* Cover Image */}
                <div className="relative w-full h-32 overflow-hidden bg-stone-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={habit.coverImage}
                    alt={habit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141922] via-transparent to-black/20 pointer-events-none" />
                  <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-black/75 px-2 py-0.5 rounded-full border border-white/10 text-stone-300 backdrop-blur-sm">
                    {habit.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {habit.title}
                    </h4>

                    <div className="text-[11px] font-mono text-amber-300/90 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Complete it to earn: {habit.xpValue} XP 🌟</span>
                    </div>

                    <div className="text-[10px] font-mono text-stone-500 mt-1">
                      {isDone ? "Completed for today!" : "Incompleted yet !!"}
                    </div>
                  </div>

                  {/* Completion Action */}
                  <button
                    type="button"
                    onClick={() => handleToggleGoodHabit(habit)}
                    className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isDone
                        ? "bg-emerald-600/90 text-white border border-emerald-400/50 shadow-sm"
                        : "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-amber-500/40"
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDone ? "text-white" : "text-stone-400"}`} />
                    <span>{isDone ? "Completed" : "Complete"}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Page Add Button */}
          <button
            type="button"
            onClick={() => onOpenNewTaskModal("HABIT")}
            className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-stone-800 hover:border-amber-500/50 bg-[#141922]/40 hover:bg-amber-500/5 flex flex-col items-center justify-center p-4 text-stone-500 hover:text-amber-300 transition-all gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-800/80 group-hover:bg-amber-500/20 border border-stone-700 group-hover:border-amber-500/40 flex items-center justify-center text-stone-400 group-hover:text-amber-400 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold font-mono">+ New Ritual</span>
          </button>
        </div>
      </div>

      {/* 2. Daily Shadow Habits Gallery */}
      <div className="bg-[#0e1217] border border-stone-800/90 rounded-2xl p-5 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <h3 className="text-sm sm:text-base font-black font-title tracking-wider text-rose-300 uppercase">
              Shadow Habits
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setBadHabitTab("ALL")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                badHabitTab === "ALL"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              All Shadows
            </button>
            <button
              type="button"
              onClick={() => setBadHabitTab("DONE")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                badHabitTab === "DONE"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Shadows Relapsed Today
            </button>
            <button
              type="button"
              onClick={() => setBadHabitTab("OVERVIEW")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                badHabitTab === "OVERVIEW"
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Overview
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredBadHabits.map((habit) => {
            const strikes = habit.strikeCount || 0;
            return (
              <div
                key={habit.id}
                className="group bg-[#141922] border border-stone-800 hover:border-rose-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md hover:-translate-y-0.5"
              >
                {/* Cover Image */}
                <div className="relative w-full h-32 overflow-hidden bg-stone-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={habit.coverImage}
                    alt={habit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141922] via-transparent to-black/30 pointer-events-none" />
                  <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/30 text-rose-300 backdrop-blur-sm">
                    HAZARD
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-rose-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {habit.title}
                    </h4>

                    <div className="text-[11px] font-mono text-rose-400/90 mt-1 flex items-center gap-1">
                      <span>Don&apos;t do it! You&apos;ll lose 💀 : {habit.xpValue} XP</span>
                    </div>

                    <div className="text-[10px] font-mono text-stone-500 mt-1">
                      {strikes > 0 ? `⚠️ Slips today: ${strikes}` : "Safe and protected"}
                    </div>
                  </div>

                  {/* Bad Habit Trigger */}
                  <button
                    type="button"
                    onClick={() => handleTriggerBadHabit(habit)}
                    className="w-full py-1.5 px-3 rounded-xl font-bold text-xs bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-700/60 hover:border-rose-500 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <span>🚨 Shit I did it 😩</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Page Add Button */}
          <button
            type="button"
            onClick={() => onOpenNewTaskModal("HABIT")}
            className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-stone-800 hover:border-rose-500/50 bg-[#141922]/40 hover:bg-rose-500/5 flex flex-col items-center justify-center p-4 text-stone-500 hover:text-rose-300 transition-all gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-800/80 group-hover:bg-rose-500/20 border border-stone-700 group-hover:border-rose-500/40 flex items-center justify-center text-stone-400 group-hover:text-rose-400 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold font-mono">+ New Shadow Habit</span>
          </button>
        </div>
      </div>

      {/* 3. Treasury Spoils Gallery */}
      <div className="bg-[#0e1217] border border-stone-800/90 rounded-2xl p-5 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80 mb-5">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-black font-title tracking-wider text-amber-300 uppercase">
              Treasury Spoils
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setRewardTab("ALL")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                rewardTab === "ALL"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              All Spoils
            </button>
            <button
              type="button"
              onClick={() => setRewardTab("CLAIMED")}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                rewardTab === "CLAIMED"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Claimed Spoils
            </button>
          </div>
        </div>

        {/* Rewards Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {rewards.map((reward) => {
            const canAfford = userGold >= reward.goldCost || userXp >= reward.xpCost;
            return (
              <div
                key={reward.id}
                className="group bg-[#141922] border border-stone-800 hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md hover:-translate-y-0.5"
              >
                {/* Cover Image */}
                <div className="relative w-full h-32 overflow-hidden bg-stone-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reward.coverImage}
                    alt={reward.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141922] via-transparent to-black/20 pointer-events-none" />
                  <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-300 backdrop-blur-sm">
                    {reward.goldCost} Gold
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                      <span>🎁</span>
                      {reward.title}
                    </h4>

                    <div className="text-[11px] font-mono text-amber-300/90 mt-1 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>Need {reward.xpCost} XP / {reward.goldCost} Gold</span>
                    </div>

                    <div className="text-[10px] font-mono text-stone-500 mt-1">
                      {canAfford ? "Ready to claim!" : "Not available yet !!"}
                    </div>
                  </div>

                  {/* Claim Button */}
                  <button
                    type="button"
                    onClick={() => handleClaimReward(reward)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                      canAfford
                        ? "bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer shadow-amber-500/20 active:scale-95"
                        : "bg-stone-800/60 text-stone-500 border border-stone-800 cursor-not-allowed"
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Claim Reward</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Page Add Button */}
          <button
            type="button"
            onClick={() => onOpenNewTaskModal("REWARD")}
            className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-stone-800 hover:border-amber-500/50 bg-[#141922]/40 hover:bg-amber-500/5 flex flex-col items-center justify-center p-4 text-stone-500 hover:text-amber-300 transition-all gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-800/80 group-hover:bg-amber-500/20 border border-stone-700 group-hover:border-amber-500/40 flex items-center justify-center text-stone-400 group-hover:text-amber-400 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold font-mono">+ Add Reward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
