"use client";

import React, { useState } from "react";
import { X, Axe, Wand2, Sword, Shield, Check, Sparkles } from "lucide-react";
import { CHARACTER_CLASSES, CharacterClassType } from "@/lib/classes";
import { soundFx } from "@/lib/audio";

interface ClassSelectModalProps {
  isOpen: boolean;
  currentClass: CharacterClassType;
  onClose: () => void;
  onClassSelected: (newClass: CharacterClassType) => void;
}

const CLASS_ICONS: Record<CharacterClassType, React.ElementType> = {
  WARRIOR: Axe,
  MAGE: Wand2,
  ROGUE: Sword,
  PALADIN: Shield,
};

export default function ClassSelectModal({
  isOpen,
  currentClass,
  onClose,
  onClassSelected,
}: ClassSelectModalProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClassType>(currentClass);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  async function handleConfirm() {
    if (selectedClass === currentClass) {
      onClose();
      return;
    }

    setLoading(true);
    setErrorMsg("");
    soundFx.playLevelUp();

    try {
      const res = await fetch("/api/user/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterClass: selectedClass }),
      });
      const data = await res.json();
      if (res.ok) {
        onClassSelected(selectedClass);
        onClose();
      } else {
        setErrorMsg(data.error || "Guild scribe rejected the class reassignment.");
      }
    } catch {
      setErrorMsg("Failed to reach guild registration.");
    } finally {
      setLoading(false);
    }
  }

  const classList = Object.values(CHARACTER_CLASSES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rpg-panel border border-[#b45309]/60 bg-[#121822] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-title text-amber-300">
                Class Specialization Guild
              </h2>
              <p className="text-xs text-slate-400">
                Select your RPG archetype to unlock specialized quest passives and stat multipliers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-950/60 border border-red-500/50 rounded text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {classList.map((cls) => {
            const Icon = CLASS_ICONS[cls.id] || Shield;
            const isSelected = selectedClass === cls.id;
            const isCurrent = currentClass === cls.id;

            return (
              <div
                key={cls.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedClass(cls.id);
                }}
                className={`p-3.5 rounded-lg border cursor-pointer select-none transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-950/30 border-amber-500 shadow-md scale-[1.02]"
                    : "bg-[#0b0e14] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{cls.name}</h4>
                        <span className="text-[10px] text-slate-400">{cls.subtitle}</span>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800/60 mb-2">
                    <span className="text-[10px] font-bold text-amber-300 block mb-0.5">
                      {cls.perkTitle}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {cls.perkDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span>Specialties: {cls.primaryAttributes.join(", ")}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-dark text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="btn-gold text-xs py-2 px-5"
          >
            {loading ? "Re-binding Soul..." : "Certify Specialization"}
          </button>
        </div>
      </div>
    </div>
  );
}
