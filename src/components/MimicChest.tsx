"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/lib/audio";

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
    <div className="rpg-panel border border-amber-900/60 p-4 text-center">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Suspicious Antique Chest</span>
        <span className="text-[10px] text-slate-500">Curiosity Hazard</span>
      </div>

      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="cursor-pointer select-none py-3 text-5xl inline-block drop-shadow-xl"
        title="Poke the suspicious chest"
      >
        🎁
      </motion.div>

      <div className="mt-2 h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {quote ? (
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight italic bg-slate-100 dark:bg-[#0b0e14] p-2 rounded border border-slate-200 dark:border-slate-800"
            >
              &ldquo;{quote}&rdquo;
            </motion.p>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-slate-500"
            >
              It seems harmless, though the wood grain appears to be breathing softly.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleClick}
        className="btn-dark text-[10px] py-1 px-3 mt-2 w-full"
      >
        Inspect Chest Closely
      </motion.button>
    </div>
  );
}
