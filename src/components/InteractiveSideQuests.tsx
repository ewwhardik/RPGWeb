"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Droplets,
  Wind,
  Trash2,
  Activity,
  HeartHandshake,
  Check,
  ChevronDown,
  ChevronUp,
  Gift,
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

interface SideQuest {
  id: string;
  title: string;
  subtitle: string;
  category: "VITALITY" | "SANITY" | "INTELLECT" | "STRENGTH" | "CHARISMA";
  icon: React.ElementType;
  iconColor: string;
  xpReward: number;
  goldReward: number;
  statReward: { name: string; amount: number };
  actionType: "CLICK" | "BREATH" | "INPUT";
}

const SIDE_QUESTS: SideQuest[] = [
  {
    id: "elixir",
    title: "Elixir of Vitality",
    subtitle: "Drink 500ml water to replenish cellular prana.",
    category: "VITALITY",
    icon: Droplets,
    iconColor: "text-cyan-400",
    xpReward: 25,
    goldReward: 10,
    statReward: { name: "Vitality", amount: 5 },
    actionType: "CLICK",
  },
  {
    id: "prana",
    title: "Prana Breathwork",
    subtitle: "Center your mind with 5 deep 4-4-4 breaths.",
    category: "SANITY",
    icon: Wind,
    iconColor: "text-emerald-400",
    xpReward: 35,
    goldReward: 15,
    statReward: { name: "Sanity", amount: 8 },
    actionType: "BREATH",
  },
  {
    id: "tab_purge",
    title: "Purge a Distraction",
    subtitle: "Close 1 unnecessary tab to clear mental clutter.",
    category: "INTELLECT",
    icon: Trash2,
    iconColor: "text-rose-400",
    xpReward: 20,
    goldReward: 10,
    statReward: { name: "Intellect", amount: 5 },
    actionType: "CLICK",
  },
  {
    id: "spine_align",
    title: "Spine Realignment",
    subtitle: "Stand tall, roll shoulders back, and stretch for 60s.",
    category: "STRENGTH",
    icon: Activity,
    iconColor: "text-amber-400",
    xpReward: 30,
    goldReward: 12,
    statReward: { name: "Strength", amount: 6 },
    actionType: "CLICK",
  },
  {
    id: "gratitude",
    title: "Inscribe Gratitude",
    subtitle: "Write 1 sincere blessing to uplift your daily spirit.",
    category: "CHARISMA",
    icon: HeartHandshake,
    iconColor: "text-purple-400",
    xpReward: 25,
    goldReward: 10,
    statReward: { name: "Charisma", amount: 5 },
    actionType: "INPUT",
  },
];

interface InteractiveSideQuestsProps {
  onReward: (xp: number, gold: number, statName: string, statAmount: number) => void;
}

export default function InteractiveSideQuests({ onReward }: InteractiveSideQuestsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [gratitudeText, setGratitudeText] = useState("");
  const [bonusClaimed, setBonusClaimed] = useState(false);

  // Breathing state for Quest 2
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(1);
  const [breathPhase, setBreathPhase] = useState<"INHALE" | "HOLD" | "EXHALE">("INHALE");

  const todayKey = new Date().toISOString().split("T")[0];

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`karmaraj_sidequests_${todayKey}`);
      if (saved) {
        setCompletedQuests(JSON.parse(saved));
      }
      const savedBonus = localStorage.getItem(`karmaraj_sidequest_bonus_${todayKey}`);
      if (savedBonus === "true") {
        setBonusClaimed(true);
      }
    } catch {}
  }, [todayKey]);

  // Breathing circle timer
  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "INHALE") return "HOLD";
        if (prev === "HOLD") return "EXHALE";
        // EXHALE -> Next breath
        setBreathCount((c) => {
          if (c >= 5) {
            setIsBreathing(false);
            handleCompleteQuest("prana");
            return 1;
          }
          return c + 1;
        });
        return "INHALE";
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const handleCompleteQuest = (questId: string) => {
    if (completedQuests[questId]) return;

    const quest = SIDE_QUESTS.find((q) => q.id === questId);
    if (!quest) return;

    soundFx.playDailyComplete();
    spawnCombatText(`⚔️ CODEX BOUNTY CLAIMED! +${quest.xpReward} XP +${quest.goldReward} GOLD`, "crit");

    onReward(quest.xpReward, quest.goldReward, quest.statReward.name, quest.statReward.amount);

    const updated = { ...completedQuests, [questId]: true };
    setCompletedQuests(updated);

    try {
      localStorage.setItem(`karmaraj_sidequests_${todayKey}`, JSON.stringify(updated));
    } catch {}
  };

  const handleClaimBonus = () => {
    if (bonusClaimed) return;
    soundFx.playLevelUp();
    spawnCombatText("👑 ALL CODEX BOUNTIES CLAIMED! +100 XP +50 GOLD", "crit");
    onReward(100, 50, "All Stats", 5);
    setBonusClaimed(true);
    try {
      localStorage.setItem(`karmaraj_sidequest_bonus_${todayKey}`, "true");
    } catch {}
  };

  const completedCount = Object.values(completedQuests).filter(Boolean).length;
  const allCompleted = completedCount === SIDE_QUESTS.length;

  return (
    <div className="w-full rounded-2xl bg-[#0c1017]/95 border border-stone-800/90 shadow-xl overflow-hidden mb-6">
      {/* Header bar */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-950/30 via-stone-900/60 to-stone-950/80 border-b border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-title text-amber-300 tracking-wide uppercase">
                Daily Codex Bounties
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {completedCount} / {SIDE_QUESTS.length} Claimed
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              Simple daily deeds to spark momentum and harvest instant karma.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allCompleted && !bonusClaimed && (
            <button
              type="button"
              onClick={handleClaimBonus}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Claim Bonus (+100 XP)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quest list */}
      {isExpanded && (
        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-300">
          {SIDE_QUESTS.map((quest) => {
            const isDone = completedQuests[quest.id];
            const Icon = quest.icon;

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between gap-3 ${
                  isDone
                    ? "bg-emerald-950/20 border-emerald-800/40 opacity-75"
                    : "bg-[#11151d]/90 border-stone-800 hover:border-amber-500/40 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-stone-900/90 border border-white/10 ${quest.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-stone-100 line-clamp-1">
                        {quest.title}
                      </span>
                    </div>

                    {isDone && (
                      <span className="p-1 rounded-md bg-emerald-600/30 border border-emerald-500/40 text-emerald-300">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                    {quest.subtitle}
                  </p>

                  {/* Reward tags */}
                  <div className="flex items-center gap-1.5 mt-2 font-mono text-[9px] font-bold">
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25">
                      +{quest.xpReward} XP
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/25">
                      +{quest.goldReward} Gold
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 border border-stone-700">
                      +{quest.statReward.amount} {quest.statReward.name}
                    </span>
                  </div>
                </div>

                {/* Interactive Action area */}
                <div className="pt-2 border-t border-white/[0.06]">
                  {isDone ? (
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Conquered Today</span>
                    </div>
                  ) : quest.actionType === "CLICK" ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteQuest(quest.id)}
                      className="w-full py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-amber-500/20 border border-stone-700 hover:border-amber-500/50 text-stone-200 hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tackle & Complete</span>
                    </button>
                  ) : quest.actionType === "BREATH" ? (
                    isBreathing ? (
                      <div className="flex flex-col items-center gap-2 p-2 bg-stone-950/80 rounded-lg border border-emerald-500/30">
                        <div className="flex items-center justify-between w-full text-[10px] font-mono text-stone-400">
                          <span>Breath {breathCount}/5</span>
                          <span className="font-bold text-emerald-400">{breathPhase}</span>
                        </div>
                        {/* Animated expanding/contracting breathing ring */}
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-ping duration-1000">
                          <Wind className="w-4 h-4 text-emerald-300" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBreathing(false)}
                          className="text-[10px] text-stone-500 hover:text-stone-300 underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsBreathing(true)}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start 5-Breaths Flow</span>
                      </button>
                    )
                  ) : quest.actionType === "INPUT" ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={gratitudeText}
                        onChange={(e) => setGratitudeText(e.target.value)}
                        placeholder="I am grateful for..."
                        className="flex-1 bg-stone-900 border border-stone-700 rounded-lg py-1 px-2.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        disabled={!gratitudeText.trim()}
                        onClick={() => {
                          handleCompleteQuest(quest.id);
                          setGratitudeText("");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black disabled:opacity-40 transition-all"
                      >
                        Seal
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
