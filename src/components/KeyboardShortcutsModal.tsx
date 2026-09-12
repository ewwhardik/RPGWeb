"use client";

import React from "react";
import { X, Keyboard, Sparkles } from "lucide-react";
import { soundFx } from "@/lib/audio";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutEntry {
  key: string;
  description: string;
  category: "Actions" | "Navigation" | "Audio";
}

const SHORTCUTS: ShortcutEntry[] = [
  { key: "N", description: "Draft a new quest dispatch", category: "Actions" },
  { key: "S", description: "Visit the merchant bazaar shop", category: "Navigation" },
  { key: "F", description: "Spin the Wheel of Unreasonable Fate", category: "Navigation" },
  { key: "C", description: "Switch Character Class archetype", category: "Navigation" },
  { key: "M", description: "Toggle audio sound effects on or off", category: "Audio" },
  { key: "?", description: "Open this keyboard shortcuts scroll", category: "Navigation" },
  { key: "Esc", description: "Dismiss active modal or popup", category: "Actions" },
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="rpg-panel carved-panel max-w-md w-full p-6 relative border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-title text-slate-100 flex items-center gap-2">
                <span>Arcane Keyboard Runes</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  SPEEDRUN
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                For adventurers who refuse to reach for their mouse.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2.5">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e141d] border border-slate-800/80 hover:border-amber-500/30 transition-colors"
            >
              <span className="text-xs text-slate-300 font-medium">
                {item.description}
              </span>
              <kbd className="px-2.5 py-1 rounded bg-[#172230] border border-slate-700 text-amber-300 font-mono text-xs font-bold shadow-inner">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Active across the entire dashboard
          </span>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="btn-gold text-[11px] py-1 px-3"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
