"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/lib/audio";
import { Sparkles } from "lucide-react";

interface MimicChestProps {
  onBonusGold: (amount: number) => void;
}

const MIMIC_QUOTES = [
  "CHOMP! Just kidding, I only consume unfulfilled New Year resolutions.",
  "You poked a mimic! Fortunately, I am currently on my union coffee break.",
  "Looking for legendary loot? All I have inside is sawdust and misplaced keys.",
  "Do not touch the brass latch! It tickles excruciatingly.",
  "A wild mimic yawns. 'Come back when you finish your math homework.'",
];

export default function MimicChest({ onBonusGold }: MimicChestProps) {
  const [clickedTimes, setClickedTimes] = useState(0);
  const [quote, setQuote] = useState<string | null>(null);
  const [claimedReward, setClaimedReward] = useState(false);

  function handleClick() {
    soundFx.playClick();
    const nextCount = clickedTimes + 1;
    setClickedTimes(nextCount);

    if (nextCount === 3 && !claimedReward) {
      soundFx.playCoin();
      setClaimedReward(true);
      setQuote("The mimic begrudgingly spits out 10 Gold from behind its wooden teeth!");
      onBonusGold(10);
      return;
    }

    const randomQuote = MIMIC_QUOTES[Math.floor(Math.random() * MIMIC_QUOTES.length)];
    setQuote(randomQuote);
  }

  return (
    <div className="rpg-panel border border-stone-200 dark:border-amber-900/60 p-4 text-center bg-card shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold font-title text-amber-950 dark:text-amber-300">
          Suspicious Antique Chest
        </span>
        <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 px-2 py-0.5 rounded">
          Curiosity Hazard
        </span>
      </div>

      <motion.div
        whileHover={{ scale: 1.12, rotate: [0, -6, 6, -6, 0] }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="cursor-pointer select-none py-3 text-5xl inline-block drop-shadow-xl"
        title="Poke the suspicious chest"
      >
        🎁
      </motion.div>

      <div className="mt-1 h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {quote ? (
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-stone-800 dark:text-amber-200 leading-tight italic bg-amber-50 dark:bg-[#0c121c] p-2.5 rounded-lg border border-amber-200 dark:border-slate-800 shadow-inner font-medium"
            >
              &ldquo;{quote}&rdquo;
            </motion.p>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed"
            >
              It seems harmless, though the wood grain appears to be breathing softly.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={handleClick}
        className="btn-dark text-xs py-2 px-3 mt-3 w-full flex items-center justify-center gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Inspect Chest Closely</span>
      </motion.button>
    </div>
  );
}
