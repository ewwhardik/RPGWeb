"use client";

import React, { useState } from "react";
import {
  Plus,
  Check,
  Flame,
  Calendar,
  ListChecks,
  Coins,
  MoreVertical,
  Trash2,
  Edit2,
  Heart,
  Zap,
  PackageOpen,
  ChevronDown,
  ChevronUp,
  Coffee,
  Sparkles,
} from "lucide-react";
import {
  getHabitColorDetails,
  getTaskNeglectDetails,
  STANDARD_SHOP_REWARDS,
} from "@/lib/taskEngine";
import { soundFx } from "@/lib/audio";

export interface TaskItem {
  id: string;
  type: "HABIT" | "DAILY" | "TODO" | "REWARD";
  title: string;
  description?: string | null;
  category: string;
  difficulty: string;
  value: number;
  up: boolean;
  down: boolean;
  counterUp: number;
  counterDown: number;
  repeatDays?: string | null;
  completedToday: boolean;
  streak: number;
  checklist?: string | null;
  dueDate?: string | null;
  cost?: number | null;
  status: string;
  createdAt: string;
}

export interface SubtaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export function parseChecklistItems(raw: unknown): SubtaskChecklistItem[] {
  if (!raw) return [];
  let parsed: unknown = raw;

  let attempts = 0;
  while (typeof parsed === "string" && attempts < 5) {
    attempts++;
    const trimmed = parsed.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "[]") {
      return [];
    }
    try {
      const next = JSON.parse(trimmed);
      if (next === parsed) break;
      parsed = next;
    } catch {
      break;
    }
  }

  // Handle case where parsed is an object instead of array (e.g. { items: [...] } or { checklist: [...] } or numeric keys)
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      parsed = obj.items;
    } else if (Array.isArray(obj.checklist)) {
      parsed = obj.checklist;
    } else if (Array.isArray(obj.subtasks)) {
      parsed = obj.subtasks;
    } else {
      const values = Object.values(obj);
      if (values.length > 0 && values.every((v) => typeof v === "object" && v !== null)) {
        parsed = values;
      } else {
        return [];
      }
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  try {
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item, idx) => ({
        id: String(item.id || `subtask-${idx}`),
        text: String(item.text || item.title || item.name || ""),
        completed: Boolean(item.completed || item.done),
      }));
  } catch {
    return [];
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  STRENGTH: "🏋️",
  INTELLECT: "📜",
  VITALITY: "🧪",
  DEXTERITY: "⚡",
  CHARISMA: "🎭",
  SANITY: "🧘",
};

const DIFFICULTY_XP: Record<string, number> = {
  TRIVIAL: 15,
  EASY: 25,
  MEDIUM: 45,
  HARD: 75,
};

const DIFFICULTY_STAT: Record<string, number> = {
  TRIVIAL: 5,
  EASY: 8,
  MEDIUM: 15,
  HARD: 25,
};

export function getTaskStatBadge(task: TaskItem) {
  const cat = (task.category || "STRENGTH").toUpperCase();
  const diff = (task.difficulty || "MEDIUM").toUpperCase();
  const xp = DIFFICULTY_XP[diff] || 35;
  const statVal = DIFFICULTY_STAT[diff] || 12;
  const statName =
    cat === "STRENGTH"
      ? "Strength"
      : cat === "INTELLECT"
      ? "Intellect"
      : cat === "VITALITY"
      ? "Vitality"
      : cat === "DEXTERITY"
      ? "Dexterity"
      : cat === "CHARISMA"
      ? "Charisma"
      : "Focus";

  return {
    xpText: `+${xp} XP`,
    statText: `+${statVal} ${statName}`,
    icon: CATEGORY_ICONS[cat] || "✨",
  };
}

interface TaskBoardGridProps {
  habits: TaskItem[];
  dailies: TaskItem[];
  todos: TaskItem[];
  rewards: TaskItem[];
  userGold: number;
  onScoreTask: (taskId: string, direction: "up" | "down") => Promise<void>;
  onBuyStandardReward: (rewardId: string, cost: number) => Promise<void>;
  onQuickAddTask: (type: "HABIT" | "DAILY" | "TODO" | "REWARD", title: string) => Promise<void>;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateChecklist: (taskId: string, newChecklistJson: string) => Promise<void>;
}

const DAYS_LABELS = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];

export default function TaskBoardGrid({
  habits,
  dailies,
  todos,
  rewards,
  userGold,
  onScoreTask,
  onBuyStandardReward,
  onQuickAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateChecklist,
}: TaskBoardGridProps) {
  // Column sub-filter states
  const [habitFilter, setHabitFilter] = useState<"ALL" | "WEAK" | "STRONG">("ALL");
  const [dailyFilter, setDailyFilter] = useState<"ALL" | "DUE" | "NOT_DUE">("ALL");
  const [todoFilter, setTodoFilter] = useState<"ACTIVE" | "DONE">("ACTIVE");
  const [rewardFilter, setRewardFilter] = useState<"ALL" | "CUSTOM" | "SHOP">("ALL");

  // Inline Quick Add inputs
  const [quickHabitTitle, setQuickHabitTitle] = useState("");
  const [quickDailyTitle, setQuickDailyTitle] = useState("");
  const [quickTodoTitle, setQuickTodoTitle] = useState("");
  const [quickRewardTitle, setQuickRewardTitle] = useState("");

  // Subtask open toggles
  const [openChecklists, setOpenChecklists] = useState<Record<string, boolean>>({});

  // Active action menu open ID
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const toggleChecklist = (taskId: string) => {
    setOpenChecklists((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleQuickAdd = async (
    type: "HABIT" | "DAILY" | "TODO" | "REWARD",
    title: string,
    clearFn: () => void
  ) => {
    if (!title.trim()) return;
    soundFx.play("click");
    await onQuickAddTask(type, title.trim());
    clearFn();
  };

  const handleSubtaskToggle = async (
    task: TaskItem,
    itemIndex: number
  ) => {
    const rawItems = parseChecklistItems(task.checklist);
    const items = Array.isArray(rawItems) ? [...rawItems] : [];
    if (items[itemIndex]) {
      items[itemIndex].completed = !items[itemIndex].completed;
      soundFx.play("click");
      await onUpdateChecklist(task.id, JSON.stringify(items));
    }
  };

  // Filter logic
  const filteredHabits = habits.filter((h) => {
    if (habitFilter === "WEAK") return h.value < 0;
    if (habitFilter === "STRONG") return h.value > 0;
    return true;
  });

  const currentDayIndex = new Date().getDay().toString();
  const filteredDailies = dailies.filter((d) => {
    const repeatArr = d.repeatDays ? d.repeatDays.split(",") : ["0", "1", "2", "3", "4", "5", "6"];
    const isDueToday = repeatArr.includes(currentDayIndex);
    if (dailyFilter === "DUE") return isDueToday && !d.completedToday;
    if (dailyFilter === "NOT_DUE") return !isDueToday || d.completedToday;
    return true;
  });

  const filteredTodos = todos.filter((t) => {
    if (todoFilter === "DONE") return t.status === "COMPLETED";
    return t.status !== "COMPLETED";
  });

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {/* ---------------------------------------------------- */}
      {/* COLUMN 1: HABITS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#1a1f26]/90 border border-[#2b3340] rounded-xl p-3.5 shadow-xl flex flex-col gap-3 min-h-[500px]">
        {/* Column Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-stone-200">Habits</span>
            <span className="text-xs font-bold text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-stone-700">
              {filteredHabits.length}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-900/90 p-0.5 rounded-lg border border-stone-800">
            {(["ALL", "WEAK", "STRONG"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setHabitFilter(f)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                  habitFilter === f
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {f === "ALL" ? "All" : f === "WEAK" ? "Weak" : "Strong"}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Habit */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuickAdd("HABIT", quickHabitTitle, () => setQuickHabitTitle(""));
          }}
          className="relative"
        >
          <input
            type="text"
            placeholder="Add a Habit..."
            value={quickHabitTitle}
            onChange={(e) => setQuickHabitTitle(e.target.value)}
            className="w-full bg-[#13161c] border border-stone-700 rounded-lg pl-3 pr-8 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors"
            title="Create Habit"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Habits Cards List */}
        <div className="flex flex-col gap-2.5">
          {filteredHabits.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-stone-800 rounded-lg">
              No habits found in this view.
            </div>
          ) : (
            filteredHabits.map((habit) => {
              const color = getHabitColorDetails(habit.value);
              const statBadge = getTaskStatBadge(habit);

              return (
                <div
                  key={habit.id}
                  className={`border rounded-lg p-2.5 transition-all shadow-sm relative group flex items-stretch gap-2.5 ${color.bgClass} ${color.borderClass}`}
                >
                  {/* Positive Button */}
                  {habit.up && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playHabitPlus();
                        onScoreTask(habit.id, "up");
                      }}
                      className="w-8 flex-shrink-0 bg-stone-900/80 hover:bg-emerald-600/30 active:scale-95 border border-stone-700 hover:border-emerald-500 text-emerald-400 font-black rounded-md flex items-center justify-center transition-all shadow-sm"
                      title="Habit performed (+XP, +Gold, +MP)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}

                  {/* Habit Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span
                          className="w-5 h-5 rounded bg-stone-900/90 border border-white/10 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 shadow-inner"
                          title={`${habit.category} Habit`}
                        >
                          {statBadge.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-stone-100 tracking-wide line-clamp-2">
                            {habit.title}
                          </div>
                          {/* Gaming Stat Reward Badges */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25">
                              {statBadge.xpText}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300 border border-stone-700/50">
                              {statBadge.statText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu trigger */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpenId(menuOpenId === habit.id ? null : habit.id)
                          }
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-200 p-0.5 rounded transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {menuOpenId === habit.id && (
                          <div className="absolute right-0 top-5 w-28 bg-stone-900 border border-stone-700 rounded-md shadow-xl py-1 z-20">
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                onEditTask(habit);
                              }}
                              className="w-full text-left px-2.5 py-1 text-xs text-stone-300 hover:bg-stone-800 flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                onDeleteTask(habit.id);
                              }}
                              className="w-full text-left px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {habit.description && (
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {habit.description}
                      </p>
                    )}

                    {/* Footer stats: Clicks counter & Score color tag */}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border border-stone-700/50 ${color.badgeBg} ${color.textClass}`}
                      >
                        {color.colorName}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        +{habit.counterUp} | -{habit.counterDown}
                      </span>
                    </div>
                  </div>

                  {/* Negative Button */}
                  {habit.down && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playHabitMinus();
                        onScoreTask(habit.id, "down");
                      }}
                      className="w-8 flex-shrink-0 bg-stone-900/80 hover:bg-red-600/30 active:scale-95 border border-stone-700 hover:border-red-500 text-red-400 font-black rounded-md flex items-center justify-center transition-all shadow-sm"
                      title="Bad habit triggered (-Health)"
                    >
                      <span className="text-base leading-none">−</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* COLUMN 2: DAILIES */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#1a1f26]/90 border border-[#2b3340] rounded-xl p-3.5 shadow-xl flex flex-col gap-3 min-h-[500px]">
        {/* Column Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-stone-200">Dailies</span>
            <span className="text-xs font-bold text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-stone-700">
              {filteredDailies.length}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-900/90 p-0.5 rounded-lg border border-stone-800">
            {(["ALL", "DUE", "NOT_DUE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDailyFilter(f)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                  dailyFilter === f
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {f === "ALL" ? "All" : f === "DUE" ? "Due" : "Done"}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Daily */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuickAdd("DAILY", quickDailyTitle, () => setQuickDailyTitle(""));
          }}
          className="relative"
        >
          <input
            type="text"
            placeholder="Add a Daily..."
            value={quickDailyTitle}
            onChange={(e) => setQuickDailyTitle(e.target.value)}
            className="w-full bg-[#13161c] border border-stone-700 rounded-lg pl-3 pr-8 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors"
            title="Create Daily"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Dailies Cards List */}
        <div className="flex flex-col gap-2.5">
          {filteredDailies.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-stone-800 rounded-lg">
              No dailies found in this view.
            </div>
          ) : (
            filteredDailies.map((daily) => {
              const repeatArr = daily.repeatDays
                ? daily.repeatDays.split(",")
                : ["0", "1", "2", "3", "4", "5", "6"];
              const neglect = getTaskNeglectDetails(daily.value);
              const statBadge = getTaskStatBadge(daily);

              return (
                <div
                  key={daily.id}
                  className={`border rounded-lg p-3 transition-all shadow-sm relative group flex items-start gap-3 ${
                    daily.completedToday
                      ? "bg-[#18231d]/60 border-emerald-800/40 opacity-70"
                      : `${neglect.bgClass} ${neglect.borderClass} ${neglect.glowClass}`
                  }`}
                >
                  {/* Daily Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playDailyComplete();
                      onScoreTask(daily.id, "up");
                    }}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      daily.completedToday
                        ? "bg-emerald-600 border-emerald-400 text-stone-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-stone-900 border-stone-600 hover:border-amber-400 text-transparent"
                    }`}
                    title={daily.completedToday ? "Uncheck Daily" : "Complete Daily"}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  {/* Daily Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <span
                            className="w-5 h-5 rounded bg-stone-900/90 border border-white/10 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 shadow-inner"
                            title={`${daily.category} Daily`}
                          >
                            {statBadge.icon}
                          </span>
                          <span
                            className={`text-xs font-bold tracking-wide transition-all ${
                              daily.completedToday
                                ? "text-stone-400 line-through"
                                : "text-stone-100"
                            }`}
                          >
                            {daily.title}
                          </span>
                        </div>

                        {/* Gaming Stat Reward Badges */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25">
                            {statBadge.xpText}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300 border border-stone-700/50">
                            {statBadge.statText}
                          </span>
                        </div>
                        {neglect.badgeText && !daily.completedToday && (
                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded inline-block ${
                                neglect.isOverdueBounty
                                  ? "bg-red-950/80 border border-red-500/60 text-red-300 animate-pulse"
                                  : "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                              }`}
                            >
                              {neglect.badgeText}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Menu trigger */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpenId(menuOpenId === daily.id ? null : daily.id)
                          }
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-200 p-0.5 rounded transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {menuOpenId === daily.id && (
                          <div className="absolute right-0 top-5 w-28 bg-stone-900 border border-stone-700 rounded-md shadow-xl py-1 z-20">
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                onEditTask(daily);
                              }}
                              className="w-full text-left px-2.5 py-1 text-xs text-stone-300 hover:bg-stone-800 flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                onDeleteTask(daily.id);
                              }}
                              className="w-full text-left px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {daily.description && (
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {daily.description}
                      </p>
                    )}

                    {/* Days of week schedule chips + Streak indicator */}
                    <div className="flex items-center justify-between gap-2 mt-2.5">
                      <div className="flex items-center gap-1">
                        {DAYS_LABELS.map((dayLabel, idx) => {
                          const isActive = repeatArr.includes(idx.toString());
                          return (
                            <span
                              key={dayLabel}
                              className={`text-[9px] font-bold px-1 rounded ${
                                isActive
                                  ? "bg-amber-950/80 text-amber-400 border border-amber-800/40"
                                  : "text-stone-600 bg-stone-900/60"
                              }`}
                            >
                              {dayLabel}
                            </span>
                          );
                        })}
                      </div>

                      <div
                        className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-950/50 border border-orange-800/40 px-1.5 py-0.5 rounded"
                        title="Consecutive daily streak"
                      >
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span>{daily.streak}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* COLUMN 3: TO-DOS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#1a1f26]/90 border border-[#2b3340] rounded-xl p-3.5 shadow-xl flex flex-col gap-3 min-h-[500px]">
        {/* Column Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-stone-200">To-Dos</span>
            <span className="text-xs font-bold text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-stone-700">
              {filteredTodos.length}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-900/90 p-0.5 rounded-lg border border-stone-800">
            {(["ACTIVE", "DONE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTodoFilter(f)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                  todoFilter === f
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {f === "ACTIVE" ? "Active" : "Done"}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add To-Do */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuickAdd("TODO", quickTodoTitle, () => setQuickTodoTitle(""));
          }}
          className="relative"
        >
          <input
            type="text"
            placeholder="Add a To-Do..."
            value={quickTodoTitle}
            onChange={(e) => setQuickTodoTitle(e.target.value)}
            className="w-full bg-[#13161c] border border-stone-700 rounded-lg pl-3 pr-8 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors"
            title="Create To-Do"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* To-Dos Cards List */}
        <div className="flex flex-col gap-2.5">
          {filteredTodos.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-stone-800 rounded-lg">
              No to-dos found in this view.
            </div>
          ) : (
            filteredTodos.map((todo) => {
              const isCompleted = todo.status === "COMPLETED";

              const parsedItems = parseChecklistItems(todo.checklist);
              const checklistItems: SubtaskChecklistItem[] = Array.isArray(parsedItems) ? parsedItems : [];
              const completedCount = Array.isArray(checklistItems)
                ? checklistItems.filter((i) => Boolean(i && i.completed)).length
                : 0;
              const hasChecklist = Array.isArray(checklistItems) && checklistItems.length > 0;
              const isChecklistOpen = openChecklists[todo.id] ?? false;
              const neglect = getTaskNeglectDetails(todo.value);
              const statBadge = getTaskStatBadge(todo);

              return (
                <div
                  key={todo.id}
                  className={`border rounded-lg p-3 transition-all shadow-sm relative group flex flex-col gap-2 ${
                    isCompleted
                      ? "bg-[#18231d]/60 border-emerald-800/40 opacity-70"
                      : `${neglect.bgClass} ${neglect.borderClass} ${neglect.glowClass}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* To-Do Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playTodoComplete();
                        onScoreTask(todo.id, "up");
                      }}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-400 text-stone-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : "bg-stone-900 border-stone-600 hover:border-amber-400 text-transparent"
                      }`}
                      title={isCompleted ? "Uncheck To-Do" : "Complete To-Do"}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* To-Do Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <span
                              className="w-5 h-5 rounded bg-stone-900/90 border border-white/10 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 shadow-inner"
                              title={`${todo.category} To-Do`}
                            >
                              {statBadge.icon}
                            </span>
                            <span
                              className={`text-xs font-bold tracking-wide transition-all ${
                                isCompleted ? "text-stone-400 line-through" : "text-stone-100"
                              }`}
                            >
                              {todo.title}
                            </span>
                          </div>

                          {/* Gaming Stat Reward Badges */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25">
                              {statBadge.xpText}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300 border border-stone-700/50">
                              {statBadge.statText}
                            </span>
                          </div>
                          {neglect.badgeText && !isCompleted && (
                            <div className="mt-1">
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded inline-block ${
                                  neglect.isOverdueBounty
                                    ? "bg-red-950/80 border border-red-500/60 text-red-300 animate-pulse"
                                    : "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                                }`}
                              >
                                {neglect.badgeText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Menu trigger */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuOpenId(menuOpenId === todo.id ? null : todo.id)
                            }
                            className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-200 p-0.5 rounded transition-opacity"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {menuOpenId === todo.id && (
                            <div className="absolute right-0 top-5 w-28 bg-stone-900 border border-stone-700 rounded-md shadow-xl py-1 z-20">
                              <button
                                onClick={() => {
                                  setMenuOpenId(null);
                                  onEditTask(todo);
                                }}
                                className="w-full text-left px-2.5 py-1 text-xs text-stone-300 hover:bg-stone-800 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setMenuOpenId(null);
                                  onDeleteTask(todo.id);
                                }}
                                className="w-full text-left px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {todo.description && (
                        <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {todo.description}
                        </p>
                      )}

                      {/* Footer tags: Subtask toggle & Due Date */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        {hasChecklist ? (
                          <button
                            onClick={() => toggleChecklist(todo.id)}
                            className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-stone-900 border border-stone-700 hover:border-amber-500/50 px-2 py-0.5 rounded transition-colors"
                          >
                            <ListChecks className="w-3 h-3" />
                            <span>
                              {completedCount}/{checklistItems.length}
                            </span>
                            {isChecklistOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        ) : (
                          <span />
                        )}

                        {todo.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-stone-400">
                            <Calendar className="w-3 h-3 text-stone-500" />
                            <span>
                              {new Date(todo.dueDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Subtask Checklist */}
                  {hasChecklist && isChecklistOpen && Array.isArray(checklistItems) && (
                    <div className="mt-1 pt-2 border-t border-stone-800/80 space-y-1 pl-8">
                      {checklistItems.map((item, idx) => (
                        <label
                          key={item.id || idx}
                          className="flex items-center gap-2 text-[11px] text-stone-300 hover:text-stone-100 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleSubtaskToggle(todo, idx)}
                            className="rounded border-stone-700 text-amber-500 focus:ring-0 w-3.5 h-3.5 bg-stone-900"
                          />
                          <span
                            className={item.completed ? "line-through text-stone-500" : ""}
                          >
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* COLUMN 4: REWARDS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#1a1f26]/90 border border-[#2b3340] rounded-xl p-3.5 shadow-xl flex flex-col gap-3 min-h-[500px]">
        {/* Column Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-stone-200">Rewards</span>
            <span className="text-xs font-bold text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-stone-700">
              {rewards.length + STANDARD_SHOP_REWARDS.length}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-900/90 p-0.5 rounded-lg border border-stone-800">
            {(["ALL", "CUSTOM", "SHOP"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRewardFilter(f)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                  rewardFilter === f
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {f === "ALL" ? "All" : f === "CUSTOM" ? "Custom" : "Shop"}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Custom Reward */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuickAdd("REWARD", quickRewardTitle, () => setQuickRewardTitle(""));
          }}
          className="relative"
        >
          <input
            type="text"
            placeholder="Add a Custom Reward..."
            value={quickRewardTitle}
            onChange={(e) => setQuickRewardTitle(e.target.value)}
            className="w-full bg-[#13161c] border border-stone-700 rounded-lg pl-3 pr-8 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors"
            title="Create Custom Reward"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Rewards List */}
        <div className="flex flex-col gap-2.5">
          {/* Custom Player Rewards */}
          {(rewardFilter === "ALL" || rewardFilter === "CUSTOM") &&
            rewards.map((reward) => {
              const cost = reward.cost || 20;
              const canAfford = userGold >= cost;

              return (
                <div
                  key={reward.id}
                  className="border border-stone-700/70 bg-[#212730] hover:border-amber-500/50 rounded-lg p-3 transition-all shadow-sm relative group flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-stone-100 tracking-wide line-clamp-1">
                        {reward.title}
                      </span>

                      {/* Menu trigger */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpenId(menuOpenId === reward.id ? null : reward.id)
                          }
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-200 p-0.5 rounded transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {menuOpenId === reward.id && (
                          <div className="absolute right-0 top-5 w-28 bg-stone-900 border border-stone-700 rounded-md shadow-xl py-1 z-20">
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                onEditTask(reward);
                              }}
                              className="w-full text-left px-2.5 py-1 text-xs text-stone-300 hover:bg-stone-800 flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                onDeleteTask(reward.id);
                              }}
                              className="w-full text-left px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {reward.description && (
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-1 leading-relaxed">
                        {reward.description}
                      </p>
                    )}
                  </div>

                  {/* Buy Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canAfford) {
                        soundFx.playRewardBuy();
                        onScoreTask(reward.id, "up");
                      }
                    }}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-all flex-shrink-0 ${
                      canAfford
                        ? "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/60 text-amber-300 active:scale-95 shadow-sm"
                        : "bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed"
                    }`}
                    title={canAfford ? `Redeem for ${cost} Gold` : "Not enough gold"}
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>{cost}</span>
                  </button>
                </div>
              );
            })}

          {/* Standard Tavern Rewards */}
          {(rewardFilter === "ALL" || rewardFilter === "SHOP") && (
            <div className="pt-2 border-t border-stone-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 px-1">
                Tavern Gear & Potions
              </div>

              {STANDARD_SHOP_REWARDS.map((shopItem) => {
                const canAfford = userGold >= shopItem.cost;

                return (
                  <div
                    key={shopItem.id}
                    className="border border-stone-700/60 bg-[#1c222a] hover:border-amber-500/50 rounded-lg p-2.5 transition-all shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-stone-900 border border-stone-700 flex items-center justify-center flex-shrink-0">
                        {shopItem.icon === "Heart" && (
                          <Heart className="w-4 h-4 text-rose-400" />
                        )}
                        {shopItem.icon === "Zap" && (
                          <Zap className="w-4 h-4 text-sky-400" />
                        )}
                        {shopItem.icon === "PackageOpen" && (
                          <PackageOpen className="w-4 h-4 text-amber-400" />
                        )}
                        {shopItem.icon === "Coffee" && (
                          <Coffee className="w-4 h-4 text-amber-500" />
                        )}
                        {shopItem.icon === "Sparkles" && (
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-200 line-clamp-1">
                          {shopItem.title}
                        </div>
                        <div className="text-[10px] text-stone-400 line-clamp-1">
                          {shopItem.description}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (canAfford) {
                          soundFx.playRewardBuy();
                          onBuyStandardReward(shopItem.id, shopItem.cost);
                        }
                      }}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-all flex-shrink-0 ${
                        canAfford
                          ? "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/60 text-amber-300 active:scale-95 shadow-sm"
                          : "bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed"
                      }`}
                      title={canAfford ? `Purchase for ${shopItem.cost} Gold` : "Not enough gold"}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>{shopItem.cost}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
