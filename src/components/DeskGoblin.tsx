"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/lib/audio";

interface DeskGoblinProps {
  gold: number;
  onFeedSuccess: (newGold: number, sanityBoost: number) => void;
}

const GOBLIN_POKES = [
  "Hey! Don't poke me, go finish your backlog!",
  "I see 3 pending quests. Would be a real shame if I spilled coffee on your router.",
  "Your posture is currently shaped like a cooked shrimp. Straighten up, adventurer!",
  "If you don't do your workout quest today, I am going to hide your left shoe.",
  "What? I'm busy staring menacingly at your unread notifications.",
  "You've been looking at this screen for a while. Blink, mortal, blink!",
  "Every time you procrastinate, my goblin heart grows half a size colder.",
  "Look at you, crossing off items like a functioning adult. I am disgusted and proud.",
];

export default function DeskGoblin({ gold, onFeedSuccess }: DeskGoblinProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [dialogue, setDialogue] = useState(
    "Greetings, meatbag. I am Bartholomew, your court-appointed procrastination goblin."
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
        setDialogue("You're broke! 5 Gold or no snacks. I don't run a goblin soup kitchen.");
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
        className="fixed bottom-4 right-4 z-40 bg-card border border-amber-600/70 p-2.5 rounded-full shadow-2xl flex items-center gap-2 text-amber-500"
        title="Summon Bartholomew the Desk Goblin"
      >
        <span className="text-xl drop-shadow-md">👺</span>
        <span className="text-xs font-bold pr-1">Bartholomew</span>
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-4 right-4 z-40 w-72 rpg-panel border border-amber-600/50 p-3.5 shadow-2xl"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            whileTap={{ scale: 0.8, rotate: -15 }}
            onClick={handlePoke}
            className="cursor-pointer select-none text-2xl drop-shadow-md"
            title="Poke Bartholomew"
          >
            👺
          </motion.div>
          <div>
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Bartholomew</h4>
            <span className="text-[10px] text-slate-500">Desk Goblin in Residence</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setIsOpen(false);
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          ✕
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={dialogue}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="p-2.5 bg-slate-100 dark:bg-[#0b0e14] rounded-lg border border-slate-200 dark:border-slate-800 text-xs mb-3 leading-relaxed relative"
        >
          <p>{dialogue}</p>
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-100 dark:bg-[#0b0e14] border-t border-l border-slate-200 dark:border-slate-800 rotate-45" />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handlePoke}
          className="btn-dark text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1"
        >
          <span>Poke Goblin</span>
        </motion.button>
        <motion.button
          whileTap={gold >= 5 && !feeding ? { scale: 0.95 } : {}}
          type="button"
          onClick={handleFeed}
          disabled={feeding || gold < 5}
          className="btn-gold text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1"
        >
          <span>Feed (5g)</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
