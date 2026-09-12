"use client";

import React, { useState } from "react";
import { X, Dices } from "lucide-react";
import { soundFx } from "@/lib/audio";

export interface WheelOfFateResult {
  success: boolean;
  message: string;
  outcomeType: string;
  newGold: number;
  newTitle: string;
  sanityBoost: number;
}

interface WheelOfFateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGold: number;
  onSpinSuccess: (data: WheelOfFateResult) => void;
}

export default function WheelOfFateModal({
  isOpen,
  onClose,
  userGold,
  onSpinSuccess,
}: WheelOfFateModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !spinning) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, spinning, onClose]);

  if (!isOpen) return null;

  async function handleSpin() {
    if (userGold < 10 || spinning) {
      if (userGold < 10) {
        soundFx.playError();
        setErrorNotice("You require at least 10 Gold to test your destiny with the wheel.");
      }
      return;
    }

    setSpinning(true);
    setErrorNotice("");
    setResultMessage(null);

    // Audio click effect during spin
    soundFx.playClick();
    const extraDegrees = 1440 + Math.floor(Math.random() * 360);
    const targetRotation = rotation + extraDegrees;
    setRotation(targetRotation);

    try {
      const res = await fetch("/api/minigames/fate", { method: "POST" });
      const data = await res.json();

      setTimeout(() => {
        if (res.ok) {
          soundFx.playCoin();
          setResultMessage(data.message);
          onSpinSuccess(data);
        } else {
          soundFx.playError();
          setErrorNotice(data.error || "The wheel broke mid-revolution.");
        }
        setSpinning(false);
      }, 1600);
    } catch {
      setTimeout(() => {
        setErrorNotice("Destiny connection timed out.");
        setSpinning(false);
      }, 1600);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rpg-panel border border-[#b45309]/70 bg-card p-6 shadow-2xl text-center relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-300">Wheel of Unreasonable Fate</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ante: 10 Gold. Outcomes: Mostly questionable.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorNotice && (
          <div className="mb-4 p-2.5 bg-red-950/60 border border-red-500/50 rounded text-red-300 text-xs">
            {errorNotice}
          </div>
        )}

        {/* The Visual Rotating Wheel */}
        <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
          {/* Top Pointer */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-amber-400 filter drop-shadow" />

          {/* Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-600/80 shadow-2xl relative overflow-hidden transition-transform ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? "1.6s" : "0s",
              background:
                "conic-gradient(#f59e0b 0deg 60deg, #38bdf8 60deg 120deg, #ef4444 120deg 180deg, #10b981 180deg 240deg, #fbbf24 240deg 300deg, #475569 300deg 360deg)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-card border-2 border-amber-400 shadow flex items-center justify-center text-amber-300 text-xs font-black">
                FATE
              </div>
            </div>
          </div>
        </div>

        {/* Result Announcement */}
        {resultMessage && (
          <div className="my-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs font-bold text-amber-200 animate-in fade-in zoom-in">
            {resultMessage}
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning || userGold < 10}
            className="btn-gold w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
          >
            <Dices className="w-4 h-4" />
            <span>{spinning ? "The wheel is spinning..." : "Spin the Wheel (10 Gold)"}</span>
          </button>

          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Current Treasury: <span className="text-amber-300 font-bold">{userGold} Gold</span>
          </p>
        </div>
      </div>
    </div>
  );
}
