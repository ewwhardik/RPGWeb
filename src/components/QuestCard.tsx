"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  Coins,
  Bug,
  Dumbbell,
  BookOpen,
  Heart,
  Zap,
  MessageSquare,
  Smile,
} from "lucide-react";
import { CATEGORY_DETAILS, QuestCategory } from "@/lib/rpgEngine";
import { soundFx } from "@/lib/audio";

export interface QuestItem {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: string;
  xpReward: number;
  goldReward: number;
  status: string;
  dueDate?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

interface QuestCardProps {
  quest: QuestItem;
  onComplete: (id: string) => Promise<void>;
  onEdit: (quest: QuestItem) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function QuestCard({
  quest,
  onComplete,
  onEdit,
  onDelete,
}: QuestCardProps) {
  const [completing, setCompleting] = useState(false);
  const [floatingBonus, setFloatingBonus] = useState<{ xp: number; gold: number } | null>(null);

  const category = (quest.category || "INTELLECT") as QuestCategory;
  const catInfo = CATEGORY_DETAILS[category] || CATEGORY_DETAILS.INTELLECT;

  const isCompleted = quest.status === "COMPLETED";
  const isAbandoned = quest.status === "ABANDONED";

  const createdTime = new Date(quest.createdAt).getTime();
  const now = Date.now();
  const isDusty = !isCompleted && !isAbandoned && now - createdTime > 48 * 60 * 60 * 1000;

  async function handleStampClick() {
    if (isCompleted || completing) return;
    setCompleting(true);
    soundFx.playStamp();

    setFloatingBonus({ xp: quest.xpReward, gold: quest.goldReward });

    setTimeout(() => {
      soundFx.playCoin();
    }, 180);

    try {
      await onComplete(quest.id);
    } catch {
      setFloatingBonus(null);
    } finally {
      setCompleting(false);
    }
  }

  function getCategoryIcon(cat: QuestCategory) {
    switch (cat) {
      case "STRENGTH": return <Dumbbell className="w-3.5 h-3.5" />;
      case "INTELLECT": return <BookOpen className="w-3.5 h-3.5" />;
      case "VITALITY": return <Heart className="w-3.5 h-3.5" />;
      case "DEXTERITY": return <Zap className="w-3.5 h-3.5" />;
      case "CHARISMA": return <MessageSquare className="w-3.5 h-3.5" />;
      case "SANITY": return <Smile className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  }

  function getDifficultyBadge(diff: string) {
    switch (diff) {
      case "TRIVIAL": return "bg-slate-700/50 text-slate-500 border-slate-600/50";
      case "EASY": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "MEDIUM": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "HARD": return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case "EPIC": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 font-bold animate-pulse";
      default: return "bg-slate-700/50 text-slate-500 border-slate-600/50";
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!isCompleted ? { scale: 1.01 } : {}}
      className={`rpg-panel relative transition-colors duration-300 p-4 border carved-panel ${
        isCompleted
          ? "opacity-60 grayscale-[40%]"
          : isDusty
          ? "border-amber-500/50 hover:border-amber-500"
          : "hover:border-slate-400 dark:hover:border-slate-500"
      }`}
      style={{ borderLeft: `4px solid ${catInfo.color}` }}
    >
      {isDusty && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
          <Bug className="w-3 h-3 text-amber-500" />
          <span>Cobwebs (48h+ idle)</span>
        </div>
      )}

      <AnimatePresence>
        {floatingBonus && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1.1 }}
            exit={{ opacity: 0, y: -40, scale: 1.2 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="bg-amber-400 text-amber-950 font-black text-sm px-4 py-2 rounded-xl shadow-2xl border-2 border-amber-200">
              +{floatingBonus.xp} XP / +{floatingBonus.gold} Gold!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border"
          style={{
            borderColor: `${catInfo.color}55`,
            backgroundColor: `${catInfo.color}15`,
            color: catInfo.color,
          }}
        >
          {getCategoryIcon(category)}
          <span>{catInfo.name}</span>
        </span>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyBadge(quest.difficulty)}`}>
          {quest.difficulty}
        </span>

        {quest.dueDate && (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 ml-auto">
            <Calendar className="w-3 h-3" />
            {new Date(quest.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      <div className="mb-3.5">
        <h3 className={`font-bold text-base leading-snug ${isCompleted ? "line-through text-stone-400 dark:text-slate-500" : "text-stone-900 dark:text-slate-100"}`}>
          {quest.title}
        </h3>
        {quest.description && (
          <p className="text-xs text-stone-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {quest.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-stone-200 dark:border-slate-800/80 mt-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold" title="XP Awarded">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>+{quest.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold" title="Gold Awarded">
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>+{quest.goldReward} Gold</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && !isAbandoned && (
            <>
              <button
                type="button"
                onClick={() => onEdit(quest)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Edit Quest"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(quest.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                title="Shred Quest"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleStampClick}
                disabled={completing}
                className="btn-gold text-xs py-1 px-3"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Stamp Slain</span>
              </motion.button>
            </>
          )}

          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 3, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="wax-stamp text-[10px] py-0.5 px-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950"
              >
                SLAIN & SEALED
              </motion.div>
            )}
          </AnimatePresence>

          {isAbandoned && (
            <div className="wax-stamp text-[10px] py-0.5 px-2 border-slate-400 text-slate-500 rotate-0 bg-slate-100 dark:bg-slate-800">
              ABANDONED
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
