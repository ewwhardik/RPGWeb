"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/lib/audio";
import { MessageSquare, Cookie, ChevronUp, ChevronDown, Sparkles } from "lucide-react";

interface DeskGoblinProps {
  gold: number;
  onFeedSuccess: (newGold: number, sanityBoost: number) => void;
}

const GOBLIN_POKES = [
  "Hey! Don't poke me, go finish your backlog!",
  "I see pending quests. Would be a real shame if I spilled coffee on your router.",
  "Your posture is currently shaped like a cooked shrimp. Straighten up, adventurer!",
  "If you do not do your quest today, I am going to hide your left shoe.",
  "What? I am busy staring menacingly at your unread notifications.",
  "You have been staring at this glass pane for a while. Blink, mortal, blink!",
  "Every time you procrastinate, my goblin heart grows half a size colder.",
  "Look at you, crossing off items like a functioning adult. I am disgusted and proud.",
];

export default function DeskGoblin({ gold, onFeedSuccess }: DeskGoblinProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dialogue, setDialogue] = useState(
    "Greetings, meatbag. I am Bartholomew, your court appointed procrastination goblin."
  );
  const [feeding, setFeeding] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  function handlePoke() {
    soundFx.playClick();
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
    const quote = GOBLIN_POKES[Math.floor(Math.random() * GOBLIN_POKES.length)];
    setDialogue(quote);
  }

  async function handleFeed() {
    if (gold < 5 || feeding) {
      if (gold < 5) {
        soundFx.playError();
        setDialogue("You are broke! 5 Gold or no snacks. I do not run a goblin soup kitchen.");
      }
      return;
    }

    setFeeding(true);
    soundFx.playCoin();

    try {
      const res = await fetch("/api/minigames/feed-goblin", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDialogue(data.message);
        onFeedSuccess(data.newGold, data.sanityGain);
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 700);
      } else {
        setDialogue(data.error || "Snack transaction aborted.");
      }
    } catch {
      setDialogue("Goblin snack network timed out.");
    } finally {
      setFeeding(false);
    }
  }

  return (
    <div className="rpg-panel border border-stone-300 dark:border-amber-900/60 p-4 bg-card shadow-sm transition-all">
      {/* Desk Goblin Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileTap={{ scale: 0.8, rotate: -15 }}
            animate={isWiggling ? { rotate: [0, -15, 15, -15, 0], scale: [1, 1.25, 1.25, 1] } : {}}
            transition={{ duration: 0.4 }}
            onClick={handlePoke}
            className="cursor-pointer select-none text-2xl drop-shadow-md hover:scale-115 transition-transform"
            title="Poke Bartholomew"
          >
            👺
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black font-title text-stone-900 dark:text-amber-300 tracking-wide">
                Bartholomew
              </h4>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800/60">
              Desk Goblin in Residence
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setIsCollapsed((prev) => !prev);
          }}
          className="p-1 rounded-md text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? "Wake Bartholomew" : "Rest Bartholomew"}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Goblin Chamber */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Speech Bubble with High Contrast Parchment Styling */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={dialogue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3 bg-amber-50/95 dark:bg-[#0c121c] rounded-xl border-2 border-amber-300/80 dark:border-amber-900/50 text-xs text-stone-900 dark:text-slate-100 leading-relaxed relative shadow-inner font-semibold"
              >
                <p>&ldquo;{dialogue}&rdquo;</p>
                <div className="absolute -top-1.5 left-5 w-3 h-3 bg-amber-50/95 dark:bg-[#0c121c] border-t-2 border-l-2 border-amber-300/80 dark:border-amber-900/50 rotate-45" />
              </motion.div>
            </AnimatePresence>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePoke}
                className="btn-dark text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5 font-bold shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Poke Goblin</span>
              </motion.button>
              <motion.button
                whileTap={gold >= 5 && !feeding ? { scale: 0.95 } : {}}
                type="button"
                onClick={handleFeed}
                disabled={feeding || gold < 5}
                className="btn-gold text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5 font-bold shadow-sm"
                title="Feeds Bartholomew for 5 Gold (+2 Sanity)"
              >
                <Cookie className="w-3.5 h-3.5" />
                <span>Feed (5g)</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCollapsed && (
        <div
          onClick={() => {
            soundFx.playClick();
            setIsCollapsed(false);
          }}
          className="text-[11px] text-stone-600 dark:text-slate-400 cursor-pointer italic hover:text-amber-800 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Bartholomew is napping under your desk blotter. Click to summon.</span>
        </div>
      )}
    </div>
  );
}
