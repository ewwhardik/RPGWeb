"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Award, ChevronRight } from "lucide-react";
import { soundFx } from "@/lib/audio";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newTitle: string;
}

export default function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newTitle,
}: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      soundFx.playLevelUp();

      // Fire festive confetti in Gold and Emerald (strictly NO purple)
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#10b981", "#fbbf24", "#34d399", "#d97706"],
        });
      } catch {}
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md rpg-panel-gold border-2 border-amber-500 bg-[#141b24] p-6 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-4 animate-bounce">
          <Award className="w-10 h-10" />
        </div>

        <div className="wax-stamp text-xs px-3 py-1 border-amber-400 text-amber-300 mb-2">
          LEVEL PROMOTION CERTIFIED
        </div>

        <h2 className="text-3xl font-black text-amber-300 tracking-wide mb-1">
          LEVEL {newLevel} REACHED!
        </h2>

        <div className="inline-block bg-[#0b0e14] px-4 py-1.5 rounded-full border border-amber-700/60 my-2">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mr-2">
            New Title:
          </span>
          <span className="text-sm font-bold text-emerald-400">{newTitle}</span>
        </div>

        <p className="text-xs text-slate-300 my-4 leading-relaxed max-w-sm mx-auto">
          The high bureaucrats of productivity have stamped your elevation. Your stamina increases,
          and even the tavern goblins are starting to show reluctant respect.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-gold w-full text-sm font-bold flex items-center justify-center gap-2"
          >
            <span>Claim Glory and Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
