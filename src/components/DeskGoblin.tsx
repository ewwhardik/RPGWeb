"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/lib/audio";
import { X, MessageSquare, Cookie } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(true);
  const [dialogue, setDialogue] = useState(
    "Greetings, meatbag. I am Bartholomew, your court appointed procrastination goblin."
  );
  const [feeding, setFeeding] = useState(false);

  function handlePoke() {
    soundFx.playClick();
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
      } else {
        setDialogue(data.error || "Snack transaction aborted.");
      }
    } catch {
      setDialogue("Goblin snack network timed out.");
    } finally {
      setFeeding(false);
    }
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => {
          soundFx.playClick();
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-card border-2 border-amber-500/70 p-2.5 rounded-full shadow-2xl flex items-center gap-2 text-amber-800 dark:text-amber-400 hover:border-amber-600 transition-all"
        title="Summon Bartholomew the Desk Goblin"
      >
        <span className="text-xl drop-shadow-md">👺</span>
        <span className="text-xs font-bold font-title pr-1">Bartholomew</span>
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-40 w-80 rpg-panel border-2 border-amber-400/80 dark:border-amber-800/80 p-4 shadow-2xl rounded-2xl bg-card"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-slate-800 mb-2.5">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileTap={{ scale: 0.8, rotate: -15 }}
            onClick={handlePoke}
            className="cursor-pointer select-none text-2xl drop-shadow-md hover:scale-110 transition-transform"
            title="Poke Bartholomew"
          >
            👺
          </motion.div>
          <div>
            <h4 className="text-xs font-black font-title text-amber-950 dark:text-amber-300">
              Bartholomew
            </h4>
            <span className="text-[10px] text-stone-500 dark:text-slate-400">
              Desk Goblin in Residence
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setIsOpen(false);
          }}
          className="text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 p-1 rounded-md"
          title="Minimize Bartholomew"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={dialogue}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="p-3 bg-amber-50/90 dark:bg-[#0c121c] rounded-xl border border-amber-200 dark:border-slate-800 text-xs text-stone-800 dark:text-slate-200 mb-3 leading-relaxed relative shadow-inner font-medium"
        >
          <p>{dialogue}</p>
          <div className="absolute -top-1.5 left-5 w-3 h-3 bg-amber-50/90 dark:bg-[#0c121c] border-t border-l border-amber-200 dark:border-slate-800 rotate-45" />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handlePoke}
          className="btn-dark text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Poke Goblin</span>
        </motion.button>
        <motion.button
          whileTap={gold >= 5 && !feeding ? { scale: 0.95 } : {}}
          type="button"
          onClick={handleFeed}
          disabled={feeding || gold < 5}
          className="btn-gold text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
          title="Feeds Bartholomew for 5 Gold (+2 Sanity)"
        >
          <Cookie className="w-3.5 h-3.5" />
          <span>Feed (5g)</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
