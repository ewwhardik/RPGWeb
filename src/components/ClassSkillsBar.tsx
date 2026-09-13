"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Axe,
  Shield,
  Megaphone,
  Eye,
  Flame,
  Sparkles,
  Zap,
  Snowflake,
  Coins,
  Sword,
  Key,
  Ghost,
  Heart,
  Sun,
  Loader2,
} from "lucide-react";
import { CLASS_SKILLS, ClassSkill } from "@/lib/taskEngine";
import { soundFx } from "@/lib/audio";

interface ClassSkillsBarProps {
  characterClass: string;
  currentMp: number;
  onSkillCast: (result: {
    message: string;
    user: {
      id: string;
      hp: number;
      maxHp: number;
      mp: number;
      maxMp: number;
      xp: number;
      gold: number;
      level: number;
    };
  }) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Axe: <Axe className="w-4 h-4 text-rose-400" />,
  Shield: <Shield className="w-4 h-4 text-emerald-400" />,
  Megaphone: <Megaphone className="w-4 h-4 text-amber-400" />,
  Eye: <Eye className="w-4 h-4 text-cyan-400" />,
  Flame: <Flame className="w-4 h-4 text-orange-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-amber-300" />,
  Zap: <Zap className="w-4 h-4 text-sky-400" />,
  Snowflake: <Snowflake className="w-4 h-4 text-cyan-300" />,
  Coins: <Coins className="w-4 h-4 text-amber-400" />,
  Sword: <Sword className="w-4 h-4 text-rose-400" />,
  Key: <Key className="w-4 h-4 text-yellow-400" />,
  Ghost: <Ghost className="w-4 h-4 text-neutral-300" />,
  Heart: <Heart className="w-4 h-4 text-rose-400" />,
  Sun: <Sun className="w-4 h-4 text-amber-300" />,
};

export default function ClassSkillsBar({
  characterClass,
  currentMp,
  onSkillCast,
}: ClassSkillsBarProps) {
  const [castingSkillId, setCastingSkillId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cleanClass = (characterClass || "WARRIOR").toUpperCase();
  const classSkills = Object.values(CLASS_SKILLS).filter(
    (s) => s.classType === cleanClass
  );

  const handleCast = useCallback(
    async (skill: ClassSkill) => {
      if (currentMp < skill.manaCost || castingSkillId) return;

      try {
        setCastingSkillId(skill.id);
        soundFx.playSpellCast();

        const res = await fetch("/api/skills/cast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: skill.id }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setToastMessage(data.message);
          onSkillCast(data);
          setTimeout(() => setToastMessage(null), 4000);
        } else {
          setToastMessage(data.error || "Failed to channel skill.");
          setTimeout(() => setToastMessage(null), 4000);
        }
      } catch {
        setToastMessage("Arcane interference prevented spell channeling.");
        setTimeout(() => setToastMessage(null), 3000);
      } finally {
        setCastingSkillId(null);
      }
    },
    [currentMp, castingSkillId, onSkillCast]
  );

  // Keyboard hotkeys [1], [2], [3], [4]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= classSkills.length) {
        const targetSkill = classSkills[keyNum - 1];
        if (targetSkill && currentMp >= targetSkill.manaCost && !castingSkillId) {
          handleCast(targetSkill);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [classSkills, currentMp, castingSkillId, handleCast]);

  const CLASS_NICKNAMES: Record<string, string> = {
    WARRIOR: "Solar Berserker",
    MAGE: "Shadow Sorcerer",
    ROGUE: "Astral Ronin",
    PALADIN: "Dharma Paladin",
  };

  return (
    // Outer Shell (Double-Bezel)
    <div className="w-full p-1.5 rounded-2xl bg-gradient-to-b from-white/10 via-white/5 to-white/0 shadow-lg ring-1 ring-white/15 mb-6">
      {/* Inner Core */}
      <div className="relative w-full p-3.5 rounded-[calc(1rem-0.125rem)] bg-[#0c1017]/95 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono font-black text-sm">#</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">
              HERO ACTIONS ({classSkills.length})
            </span>
            <span className="hidden sm:inline-block text-[10px] text-neutral-400 font-mono">
              • Press [1] - [{classSkills.length}]
            </span>
          </div>

          <div className="flex items-center gap-3">
            {toastMessage && (
              <div className="text-xs text-amber-300 bg-black/80 border border-amber-500/40 px-3 py-1 rounded-full shadow animate-in fade-in duration-150">
                {toastMessage}
              </div>
            )}
            <span className="text-xs font-serif italic text-amber-300/90 tracking-wide font-medium">
              {CLASS_NICKNAMES[cleanClass] || `${cleanClass} Champion`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {classSkills.map((skill, idx) => {
            const hasMana = currentMp >= skill.manaCost;
            const isCasting = castingSkillId === skill.id;

            return (
              <button
                key={skill.id}
                onClick={() => handleCast(skill)}
                disabled={!hasMana || isCasting}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group active:scale-[0.98] ${
                  hasMana
                    ? "bg-neutral-900/90 border-white/10 hover:border-amber-400/50 hover:bg-neutral-850 shadow-sm"
                    : "bg-black/40 border-white/5 opacity-40 cursor-not-allowed"
                }`}
                title={skill.description}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-black/60 border border-white/10 group-hover:scale-105 transition-transform">
                      {ICON_MAP[skill.icon] || <Zap className="w-4 h-4 text-amber-400" />}
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {skill.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Hotkey pill */}
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 border border-white/15 text-neutral-300">
                      {idx + 1}
                    </span>
                    {/* Mana Cost Pill */}
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-sky-400 bg-sky-950/80 border border-sky-500/30 px-1.5 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5" />
                      <span>{skill.manaCost}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                {isCasting && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Channeling Arcana...</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
