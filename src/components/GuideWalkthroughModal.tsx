"use client";

import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Swords,
  BookOpen,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface GuideWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDocs: () => void;
}

interface GuideChapter {
  step: number;
  title: string;
  subtitle: string;
  icon: typeof Sparkles;
  accentColor: string;
  simpleExplanation: string[];
  proTip: string;
}

const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    step: 1,
    title: "The Core Idea: Turn Your Life Into An Epic RPG",
    subtitle: "Stop dreading chores. Earn real XP and Gold instead.",
    icon: Sparkles,
    accentColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    simpleExplanation: [
      "Every single thing you do in real life—reading, working out, washing dishes, coding, or meditating—is now a heroic quest.",
      "When you finish a task, you instantly gain Experience (XP) and Gold coins.",
      "As your XP grows, your character Levels Up, unlocking legendary titles, pets, mounts, and tavern perks.",
    ],
    proTip: "Start by completing 2 small habits today to feel your first XP rush and hear the level chime!",
  },
  {
    step: 2,
    title: "Good Habits vs Bad Habits (The Dopamine Balance)",
    subtitle: "Reward your virtues, defend against distractions.",
    icon: Flame,
    accentColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    simpleExplanation: [
      "Good Habits (Deep Work, Exercise, Healthy Eating) give you continuous positive dopamine, granting XP and Gold on every completion.",
      "Bad Habits (Doomscrolling, Fast Food, Procrastination) represent hazards. Clicking them penalizes your Health (HP) and fuels Guild Boss Rage.",
      "You can view habits in both the Classic 4-Column Board and the Chrono Pixel Art Gallery!",
    ],
    proTip: "If you resist a bad craving, give yourself a mental high five—your avatar stays at full vitality!",
  },
  {
    step: 3,
    title: "Dailies, To-Dos & Multi-Step Checklists",
    subtitle: "Build iron consistency without getting overwhelmed.",
    icon: CheckCircle2,
    accentColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    simpleExplanation: [
      "Dailies are your recurring routines (morning stretches, drinking 2L water, reading 10 pages). They reset each midnight.",
      "Completing dailies builds Streaks. The higher your streak, the higher your multiplier bonus!",
      "To-Dos are flexible one-off missions. You can break big projects down into subtasks with step-by-step checklists.",
    ],
    proTip: "Check off subtasks as you go. Each subtask tick makes a satisfying thock sound and brings you closer to 100% completion!",
  },
  {
    step: 4,
    title: "The Pomodoro Focus Chamber",
    subtitle: "25 minutes of pure distraction-free concentration.",
    icon: Clock,
    accentColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    simpleExplanation: [
      "Located in the Chrono Focus Sidebar, the Pomodoro timer breaks your work into 25-minute focus intervals followed by 5-minute restorative breaks.",
      "When the 25-minute timer finishes, you hear an audio celebration and automatically receive +35 XP and +15 Gold!",
      "It converts intangible work sessions into tangible quest rewards.",
    ],
    proTip: "Put your phone in another room, hit Start, and sprint until the chime rings!",
  },
  {
    step: 5,
    title: "Time Awareness & Real Weather",
    subtitle: "Life is short. The clock and weather remind you to seize the day.",
    icon: Compass,
    accentColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    simpleExplanation: [
      "The top bar features an active Analog Clock and Live Geolocation Weather with a 7-day forecast strip.",
      "Right next to it are the 4 Life Elapsed Meters: Year, Month, Week, and Day.",
      "Seeing that 68% of today has already passed creates a healthy, motivating urgency to slay your remaining quests before sunset.",
    ],
    proTip: "Toggle between Fahrenheit and Celsius anytime with a single tap on the temperature badge!",
  },
  {
    step: 6,
    title: "Cooperative Guild Boss Raids & Samsara Heatmap",
    subtitle: "Team up with friends to conquer procrastination titans.",
    icon: Swords,
    accentColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    simpleExplanation: [
      "You don't have to quest alone. Invite friends using your Guild Code to attack legendary titans like Kumbhakarna and Maya.",
      "Every quest you or your guild mates complete inflicts real raid damage on the boss!",
      "The Samsara Energy Heatmap visualizes your yearly consistency across the 4 Vedic life aims: Dharma (Duty), Artha (Wealth), Kama (Wellness), and Moksha (Transcendence).",
    ],
    proTip: "Defeating a Boss awards 100 Gold bounties to every active member in the guild!",
  },
];

export default function GuideWalkthroughModal({
  isOpen,
  onClose,
  onOpenDocs,
}: GuideWalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const chapter = GUIDE_CHAPTERS[currentStep];
  const Icon = chapter.icon;

  const handleNext = () => {
    if (currentStep < GUIDE_CHAPTERS.length - 1) {
      soundFx.playClick();
      setCurrentStep((s) => s + 1);
    } else {
      soundFx.playLevelUp();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      soundFx.playClick();
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e1217] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-stone-100 flex flex-col justify-between min-h-[520px]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-title text-amber-300">
                  The Guru&apos;s Guidance • Simple Step-by-Step Walkthrough
                </h3>
                <p className="text-[11px] text-stone-400">
                  Chapter {chapter.step} of {GUIDE_CHAPTERS.length}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors border border-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 my-4">
            {GUIDE_CHAPTERS.map((c, idx) => (
              <button
                key={c.step}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setCurrentStep(idx);
                }}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    : idx < currentStep
                    ? "bg-emerald-500/80"
                    : "bg-stone-800"
                }`}
                title={`Jump to Chapter ${c.step}`}
              />
            ))}
          </div>

          {/* Chapter Content */}
          <div className="space-y-4 my-2">
            {/* Title & Badge */}
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${chapter.accentColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black font-title text-stone-100">
                  {chapter.title}
                </h2>
                <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                  {chapter.subtitle}
                </p>
              </div>
            </div>

            {/* Bullet Points */}
            <div className="bg-[#141922] p-4 rounded-2xl border border-stone-800/90 space-y-2.5">
              {chapter.simpleExplanation.map((text, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-stone-200 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Pro-Tip Box */}
            <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-300">Adventurer Tip: </span>
                <span>{chapter.proTip}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-800 mt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDocs();
            }}
            className="text-xs font-mono text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Full Docs</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors border border-stone-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>{currentStep === GUIDE_CHAPTERS.length - 1 ? "Begin My Journey! 🚀" : "Next Chapter"}</span>
              {currentStep !== GUIDE_CHAPTERS.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
