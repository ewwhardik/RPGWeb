"use client";

import React, { useState } from "react";
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
  const [stampAnimation, setStampAnimation] = useState(false);
  const [floatingBonus, setFloatingBonus] = useState<{ xp: number; gold: number } | null>(null);

  const category = (quest.category || "INTELLECT") as QuestCategory;
  const catInfo = CATEGORY_DETAILS[category] || CATEGORY_DETAILS.INTELLECT;

  const isCompleted = quest.status === "COMPLETED";
  const isAbandoned = quest.status === "ABANDONED";

  // Check if quest is dusty / neglected (older than 48 hours and still TODO)
  const createdTime = new Date(quest.createdAt).getTime();
  const now = Date.now();
  const isDusty = !isCompleted && !isAbandoned && now - createdTime > 48 * 60 * 60 * 1000;

  async function handleStampClick() {
    if (isCompleted || completing) return;
    setCompleting(true);
    soundFx.playStamp();

    // Trigger visual stamp slap
    setStampAnimation(true);
    setFloatingBonus({ xp: quest.xpReward, gold: quest.goldReward });

    setTimeout(() => {
      soundFx.playCoin();
    }, 180);

    try {
      await onComplete(quest.id);
    } catch {
      setStampAnimation(false);
      setFloatingBonus(null);
    } finally {
      setCompleting(false);
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
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  }

  function getDifficultyBadge(diff: string) {
    switch (diff) {
      case "TRIVIAL":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "EASY":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800/60";
      case "MEDIUM":
        return "bg-amber-950/80 text-amber-300 border-amber-800/60";
      case "HARD":
        return "bg-orange-950/80 text-orange-300 border-orange-800/60";
      case "EPIC":
        return "bg-red-950/80 text-red-300 border-red-800/60 animate-pulse";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  }

  return (
    <div
      className={`rpg-panel relative transition-all duration-200 p-4.5 border carved-panel ${
        isCompleted
          ? "bg-[#0d1219]/70 border-emerald-900/40 opacity-75"
          : isDusty
          ? "bg-[#141820] border-amber-900/60 hover:border-amber-700/80"
          : "bg-[#121822] border-slate-800 hover:border-slate-700"
      }`}
      style={{
        borderLeft: `4px solid ${catInfo.color}`,
      }}
    >
      {/* Dusty Cobwebs Warning */}
      {isDusty && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
          <Bug className="w-3 h-3 text-amber-400" />
          <span>Cobwebs (48h+ idle)</span>
        </div>
      )}

      {/* Floating XP / Gold indicator on completion */}
      {floatingBonus && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none animate-bounce">
          <div className="bg-amber-500 text-slate-950 font-black text-sm px-3.5 py-1.5 rounded-lg shadow-xl border border-amber-300">
            +{floatingBonus.xp} XP / +{floatingBonus.gold} Gold!
          </div>
        </div>
      )}

      {/* Header Tags with color coding */}
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

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyBadge(
            quest.difficulty
          )}`}
        >
          {quest.difficulty}
        </span>

        {quest.dueDate && (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
            <Calendar className="w-3 h-3 text-slate-500" />
            {new Date(quest.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Quest Title & Description */}
      <div className="mb-3.5">
        <h3
          className={`font-bold text-base leading-snug ${
            isCompleted ? "line-through text-slate-500" : "text-slate-100"
          }`}
        >
          {quest.title}
        </h3>
        {quest.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {quest.description}
          </p>
        )}
      </div>

      {/* Footer: Rewards & Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 mt-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-bold" title="XP Awarded">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>+{quest.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-bold" title="Gold Awarded">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>+{quest.goldReward} Gold</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isCompleted && !isAbandoned && (
            <>
              <button
                type="button"
                onClick={() => onEdit(quest)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                title="Edit Quest"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(quest.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                title="Shred Quest"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleStampClick}
                disabled={completing}
                className={`btn-gold text-xs py-1 px-3 ${
                  stampAnimation ? "scale-95 bg-emerald-500" : ""
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Stamp Slain</span>
              </button>
            </>
          )}

          {isCompleted && (
            <div className="wax-stamp text-[10px] py-0.5 px-2 border-emerald-500 text-emerald-400">
              SLAIN & SEALED
            </div>
          )}

          {isAbandoned && (
            <div className="wax-stamp text-[10px] py-0.5 px-2 border-slate-600 text-slate-400 rotate-0">
              ABANDONED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
