"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckSquare,
  Ban,
  Gift,
  BarChart3,
  BookOpen,
  Flame,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";
import ChronoHumanoid3D from "./ChronoHumanoid3D";

export interface ChronoStatusSidebarProps {
  user: {
    username: string;
    level: number;
    xp: number;
    characterClass?: string;
    gold: number;
  };
  activeSection: string;
  onSelectSection: (section: string) => void;
  onPomodoroReward?: (xpReward: number, goldReward: number) => void;
}

export default function ChronoStatusSidebar({
  user,
  activeSection,
  onSelectSection,
  onPomodoroReward,
}: ChronoStatusSidebarProps) {
  // Pomodoro State
  const [timerMode, setTimerMode] = useState<"POMODORO" | "SHORT_BREAK" | "LONG_BREAK">("POMODORO");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mode durations in seconds
  const modeDurations = {
    POMODORO: 25 * 60,
    SHORT_BREAK: 5 * 60,
    LONG_BREAK: 15 * 60,
  };

  const handleSelectMode = (mode: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK") => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(modeDurations[mode]);
    soundFx.playClick();
  };

  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev);
    soundFx.playClick();
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeDurations[timerMode]);
    soundFx.playClick();
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);

            if (soundEnabled) {
              soundFx.playLevelUp();
            }

            if (timerMode === "POMODORO") {
              setCompletedSessions((c) => c + 1);
              spawnCombatText("🍅 POMODORO MASTERY! +35 XP +15 GOLD", "crit");
              if (onPomodoroReward) {
                onPomodoroReward(35, 15);
              }
            } else {
              spawnCombatText("☕ BREAK CONCLUDED! FOCUS RESTORED", "mana");
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled, timerMode, onPomodoroReward]);

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Greeting based on hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const charClass = (user.characterClass || "WIZARD").toUpperCase();
  const classIcon =
    charClass === "MAGE" || charClass === "WIZARD"
      ? "🧙"
      : charClass === "PALADIN"
      ? "🛡️"
      : charClass === "ROGUE"
      ? "🥷"
      : "⚔️";

  // Today date formatted
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Daily target calculation
  const dailyTarget = 150;
  const todayXp = (user.xp % 100) + completedSessions * 35;
  const xpLeft = Math.max(0, dailyTarget - todayXp);
  const progressPercent = Math.min(100, Math.round((todayXp / dailyTarget) * 100));

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-5">
      {/* 1. Status Window Panel */}
      <div className="bg-[#0e1217] border border-stone-800/90 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        {/* Notch Title */}
        <div className="text-[11px] font-mono tracking-widest uppercase text-stone-400 font-bold mb-3 pb-2 border-b border-stone-800/80 flex items-center justify-between">
          <span>Status-Window</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            ACTIVE
          </span>
        </div>

        {/* Pixel Art Cozy Stream Cover Banner */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-stone-800 bg-stone-950 shadow-inner group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
            alt="Pixel Art Hearth Station"
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1217] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] font-mono font-bold bg-black/75 px-2 py-0.5 rounded border border-white/10 text-stone-200 backdrop-blur-sm">
            <span>{classIcon}</span>
            <span>{user.characterClass || "Wizard"}</span>
          </div>
        </div>

        {/* User Greeting & Date */}
        <div className="space-y-1 mb-3">
          <div className="text-xs font-bold text-stone-200">
            {greeting}, <span className="text-amber-400">{user.username}</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400/90">
            Today is {todayFormatted}
          </div>
        </div>

        {/* Daily XP Stats */}
        <div className="bg-[#141922] p-2.5 rounded-xl border border-stone-800/80 space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between text-stone-300">
            <span>Total XP Left:</span>
            <span className="text-rose-400 font-bold">{xpLeft} XP 🔴</span>
          </div>
          <div className="flex items-center justify-between text-stone-300">
            <span>Today:</span>
            <span className="text-amber-400 font-bold">{todayXp} XP 🟡</span>
          </div>
          <div className="flex items-center justify-between text-stone-400 text-[10px] pt-1 border-t border-stone-800">
            <span>Keep Going</span>
            <span className="text-emerald-400 font-bold">{progressPercent}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Built-in Pomodoro Focus Timer */}
      <div className="bg-[#0e1217] border border-stone-800/90 rounded-2xl p-4 shadow-xl text-center space-y-3">
        {/* Timer Mode Pills */}
        <div className="flex items-center justify-center gap-1.5 bg-[#141922] p-1 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => handleSelectMode("POMODORO")}
            className={`text-[10px] font-bold py-1 px-2.5 rounded-lg transition-all ${
              timerMode === "POMODORO"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Pomodoro
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode("SHORT_BREAK")}
            className={`text-[10px] font-bold py-1 px-2.5 rounded-lg transition-all ${
              timerMode === "SHORT_BREAK"
                ? "bg-emerald-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Short Break
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode("LONG_BREAK")}
            className={`text-[10px] font-bold py-1 px-2.5 rounded-lg transition-all ${
              timerMode === "LONG_BREAK"
                ? "bg-sky-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Big Bold Digital Timer */}
        <div className="py-2">
          <div className="text-4xl sm:text-5xl font-mono font-black tracking-wider text-stone-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {timerString}
          </div>
          <div className="text-[10px] font-mono text-stone-400 flex items-center justify-center gap-1 mt-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Completed Today: {completedSessions} Sessions</span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleToggleTimer}
            className="flex-1 py-2 px-4 rounded-xl bg-stone-100 hover:bg-white text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetTimer}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? "bg-stone-800 border-stone-700 text-amber-400"
                : "bg-stone-900 border-stone-800 text-stone-600"
            }`}
            title={soundEnabled ? "Sound Enabled" : "Sound Muted"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="text-[9px] font-mono text-amber-300/80 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
          ✨ Completing 25m Focus awards +35 XP & +15 Gold
        </div>
      </div>

      {/* 3. Navigation Dock */}
      <div className="bg-[#0e1217] border border-stone-800/90 rounded-2xl p-4 shadow-xl">
        <div className="text-[11px] font-mono tracking-widest uppercase text-stone-400 font-bold mb-3 pb-2 border-b border-stone-800/80">
          Navigation
        </div>

        <nav className="flex flex-col gap-1 text-xs">
          <button
            type="button"
            onClick={() => onSelectSection("chrono-habits")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left ${
              activeSection === "chrono-habits"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Good Habits</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection("chrono-bad-habits")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left ${
              activeSection === "chrono-bad-habits"
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
            }`}
          >
            <Ban className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Bad Habits</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection("chrono-rewards")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left ${
              activeSection === "chrono-rewards"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
            }`}
          >
            <Gift className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Rewards</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection("analytics-graphs")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left ${
              activeSection === "analytics-graphs"
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>Progress Graphs</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection("guide-docs")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left ${
              activeSection === "guide-docs"
                ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Guide & Docs</span>
          </button>
        </nav>
      </div>

      {/* 4. Interactive 3D Astral Humanoid Model (Exclusive to Chrono Focus Mode) */}
      <ChronoHumanoid3D />
    </aside>
  );
}
