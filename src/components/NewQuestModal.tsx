"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Lightbulb,
  Coins,
  Dumbbell,
  BookOpen,
  Heart,
  Zap,
  MessageSquare,
  Smile,
  Calendar,
} from "lucide-react";
import {
  CATEGORY_DETAILS,
  DIFFICULTY_MULTIPLIERS,
  QuestCategory,
  QuestDifficulty,
} from "@/lib/rpgEngine";
import { soundFx } from "@/lib/audio";

export interface QuestFormData {
  id?: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: string;
  dueDate?: string | null;
}

interface NewQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questData: QuestFormData) => Promise<void>;
  initialData?: QuestFormData | null;
}

const WITTY_QUEST_PROMPTS = [
  {
    title: "Survive intense gym leg day without crying",
    category: "STRENGTH",
    difficulty: "HARD",
    description: "Squats, lunges, and the heavy burden of my past choices.",
  },
  {
    title: "Vanquish the git rebase merge monster",
    category: "INTELLECT",
    difficulty: "HARD",
    description: "Resolve 14 conflicting chunks without force pushing to main like a coward.",
  },
  {
    title: "Drink 2 full liters of unflavored tap water",
    category: "VITALITY",
    difficulty: "EASY",
    description: "No coffee, no soda, just raw liquid life.",
  },
  {
    title: "Speedrun washing the sink mountain of dishes",
    category: "DEXTERITY",
    difficulty: "MEDIUM",
    description: "Scrub the frying pan before it gains self-awareness.",
  },
  {
    title: "Reply to the dreaded email lingering for 3 weeks",
    category: "CHARISMA",
    difficulty: "HARD",
    description: "Start with 'Apologies for the delay' and manifest supreme composure.",
  },
  {
    title: "Touch genuine lawn grass for 10 uninterrupted minutes",
    category: "SANITY",
    difficulty: "TRIVIAL",
    description: "Step away from all glowing rectangles and inhale chlorophyll.",
  },
  {
    title: "Cook a real dinner instead of ordering takeout",
    category: "VITALITY",
    difficulty: "MEDIUM",
    description: "Vegetables, protein, and zero delivery fees.",
  },
];

const CATEGORIES: QuestCategory[] = [
  "STRENGTH",
  "INTELLECT",
  "VITALITY",
  "DEXTERITY",
  "CHARISMA",
  "SANITY",
];

const DIFFICULTIES: QuestDifficulty[] = ["TRIVIAL", "EASY", "MEDIUM", "HARD", "EPIC"];

export default function NewQuestModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: NewQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("INTELLECT");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("DAILY");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory((initialData.category as QuestCategory) || "INTELLECT");
      setDifficulty((initialData.difficulty as QuestDifficulty) || "MEDIUM");
      setDueDate(initialData.dueDate ? initialData.dueDate.substring(0, 10) : "");
      setIsRecurring(initialData.isRecurring || false);
      setRecurrenceType(initialData.recurrenceType || "DAILY");
    } else {
      setTitle("");
      setDescription("");
      setCategory("INTELLECT");
      setDifficulty("MEDIUM");
      setDueDate("");
    }
    setErrorMsg("");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [initialData, isOpen, onClose]);

  if (!isOpen) return null;

  const currentRewards = DIFFICULTY_MULTIPLIERS[difficulty] || DIFFICULTY_MULTIPLIERS.MEDIUM;

  function pickRandomPrompt() {
    soundFx.playClick();
    const prompt = WITTY_QUEST_PROMPTS[Math.floor(Math.random() * WITTY_QUEST_PROMPTS.length)];
    setTitle(prompt.title);
    setCategory(prompt.category as QuestCategory);
    setDifficulty(prompt.difficulty as QuestDifficulty);
    setDescription(prompt.description);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Even the humblest quest must possess a title.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        difficulty,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      soundFx.playClick();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to commit quest to the archives.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  function getCategoryIcon(cat: QuestCategory) {
    switch (cat) {
      case "STRENGTH":
        return <Dumbbell className="w-3.5 h-3.5" />;
      case "INTELLECT":
        return <BookOpen className="w-3.5 h-3.5" />;
      case "VITALITY":
        return <Heart className="w-3.5 h-3.5" />;
      case "DEXTERITY":
        return <Zap className="w-3.5 h-3.5" />;
      case "CHARISMA":
        return <MessageSquare className="w-3.5 h-3.5" />;
      case "SANITY":
        return <Smile className="w-3.5 h-3.5" />;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rpg-panel border border-[#b45309]/60 bg-card p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-slate-700 mb-4">
          <div>
            <h2 className="text-lg font-bold text-amber-300">
              {initialData ? "Renegotiate Quest Terms" : "Draft New Quest Scroll"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transform mundane real-world friction into virtual glory and loot.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-950/60 border border-red-500/50 rounded text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quest Title</label>
              {!initialData && (
                <button
                  type="button"
                  onClick={pickRandomPrompt}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>Inspire Me</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Conquer 45 minutes on the elliptical..."
              className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Quest Log Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this must be done, or what snacks to eat after completion..."
              className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-md py-2 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Attribute Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const info = CATEGORY_DETAILS[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 p-2 rounded-md border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-background border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 px-2 rounded-md border text-center text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                        : "bg-background border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rewards Preview Box */}
          <div className="p-3 bg-background rounded-lg border border-amber-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Yield upon completion:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                +{currentRewards.xp} XP
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Coins className="w-3.5 h-3.5" />
                +{currentRewards.gold} Gold
              </span>
              <span className="text-emerald-400 font-bold">
                +{currentRewards.statPoints} {CATEGORY_DETAILS[category].name}
              </span>
            </div>
          </div>

          {/* Due Date & Recurrence Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Deadline / Target Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-md py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Recurring Quest</span>
                <input 
                  type="checkbox" 
                  checked={isRecurring} 
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="accent-amber-500 w-3 h-3"
                />
              </label>
              {isRecurring && (
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-md py-2 px-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-dark text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold text-xs py-2 px-5"
            >
              {loading
                ? "Writing to parchment..."
                : initialData
                ? "Update Terms"
                : "Seal and Post Quest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
