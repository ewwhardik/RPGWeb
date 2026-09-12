"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/lib/audio";
import { MessageSquare, ChevronUp, ChevronDown, Sparkles } from "lucide-react";

interface DeskGoblinProps {
  gold: number;
  onFeedSuccess: (newGold: number, sanityBoost: number) => void;
}

const GOBLIN_POKES = [
  "Beta, Sharma ji ka beta already finished 5 daily quests and reached Level 40 before 6 AM! What are you doing?!",
  "Arre bhai, one more notification and my third eye is opening in rage! Drink some Kadak Chai!",
  "Is this a task list or an epic Mahabharata of pending bugs? Finish your Dharma first!",
  "You call this tapasya? I have seen more focus in a Mumbai local train at peak hour! Get back to questing!",
  "Where is my Garam Samosa?! Give me a samosa or I will curse your next loot drop with 100% rust!",
  "Your posture is currently shaped like a fried jalebi. Straighten up, adventurer!",
  "Focus, babu! Focus! The mind wanders like a monkey in Vrindavan without your daily checklists.",
  "Look at you, crossing off items like a functioning adult. I am both disgusted and proud.",
  "Hey! Don't poke me, go finish your backlog or I will tell your relatives you're doomscrolling!",
  "Bhai, your daily streak is looking fragile. One missed quest and Kumbhakarna wakes up!",
];

export default function DeskGoblin({ gold, onFeedSuccess }: DeskGoblinProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dialogue, setDialogue] = useState(
    "Arre meatbag! I am Bartholomew, your court-appointed Desi procrastination goblin. Do your dharma!"
  );
  const [feeding, setFeeding] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [fedCount, setFedCount] = useState(0);
  const [lastFedTreat, setLastFedTreat] = useState<string>("");

  // Compute dynamic playful mood
  const mood = fedCount >= 3
    ? { name: "Royal Kaju Bliss", emoji: "💎", tagClass: "text-amber-300 border-amber-500/60 bg-amber-950/50" }
    : lastFedTreat === "chai"
    ? { name: "Kadak Chai Energized", emoji: "☕", tagClass: "text-orange-300 border-orange-500/60 bg-orange-950/50" }
    : fedCount >= 1
    ? { name: "Samosa Satisfied", emoji: "🥟", tagClass: "text-emerald-300 border-emerald-500/60 bg-emerald-950/50" }
    : pokeCount >= 6
    ? { name: "Sharmaji Level Fury", emoji: "💥", tagClass: "text-red-300 border-red-500/60 bg-red-950/50" }
    : pokeCount >= 3
    ? { name: "Scheming Mischief", emoji: "😈", tagClass: "text-violet-300 border-violet-500/60 bg-violet-950/50" }
    : { name: "Dharmic Watchman", emoji: "🧌", tagClass: "text-amber-400 border-amber-500/40 bg-amber-950/30" };

  function handlePoke() {
    soundFx.playClick();
    setIsWiggling(true);
    setPokeCount((prev) => prev + 1);
    setTimeout(() => setIsWiggling(false), 500);
    const quote = GOBLIN_POKES[Math.floor(Math.random() * GOBLIN_POKES.length)];
    setDialogue(quote);
  }

  async function handleFeed(treatType: "samosa" | "chai" | "kaju_katli" = "samosa") {
    const costMap = { samosa: 5, chai: 8, kaju_katli: 15 };
    const cost = costMap[treatType];

    if (gold < cost || feeding) {
      if (gold < cost) {
        soundFx.playError();
        setDialogue(`Arre kanjoos! You need ${cost} Gold for this treat. I do not run a free langar here!`);
      }
      return;
    }

    setFeeding(true);
    soundFx.playCoin();

    try {
      const res = await fetch("/api/minigames/feed-goblin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ treatType }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialogue(data.message);
        setFedCount((prev) => prev + 1);
        setLastFedTreat(treatType);
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
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800/60">
                Desk Goblin
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border transition-all ${mood.tagClass}`}>
                {mood.emoji} {mood.name}
              </span>
            </div>
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

            {/* Interaction Buttons: Poke & Indian Snacks */}
            <div className="space-y-2 pt-0.5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePoke}
                className="w-full btn-dark text-xs py-2 px-3 flex items-center justify-center gap-1.5 font-bold shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Poke Bartholomew</span>
              </motion.button>

              <div className="grid grid-cols-3 gap-1.5">
                <motion.button
                  whileTap={gold >= 5 && !feeding ? { scale: 0.95 } : {}}
                  type="button"
                  onClick={() => handleFeed("samosa")}
                  disabled={feeding || gold < 5}
                  className="btn-gold text-[11px] py-1.5 px-2 flex flex-col items-center justify-center font-bold shadow-sm disabled:opacity-50"
                  title="Feed Garam Samosa for 5 Gold (+2 Sanity)"
                >
                  <span className="text-sm">🥟</span>
                  <span>Samosa (5g)</span>
                </motion.button>

                <motion.button
                  whileTap={gold >= 8 && !feeding ? { scale: 0.95 } : {}}
                  type="button"
                  onClick={() => handleFeed("chai")}
                  disabled={feeding || gold < 8}
                  className="btn-gold text-[11px] py-1.5 px-2 flex flex-col items-center justify-center font-bold shadow-sm disabled:opacity-50 bg-gradient-to-r from-orange-600 to-amber-600"
                  title="Feed Kadak Cutting Chai for 8 Gold (+4 Sanity)"
                >
                  <span className="text-sm">☕</span>
                  <span>Chai (8g)</span>
                </motion.button>

                <motion.button
                  whileTap={gold >= 15 && !feeding ? { scale: 0.95 } : {}}
                  type="button"
                  onClick={() => handleFeed("kaju_katli")}
                  disabled={feeding || gold < 15}
                  className="btn-gold text-[11px] py-1.5 px-2 flex flex-col items-center justify-center font-bold shadow-sm disabled:opacity-50 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950"
                  title="Feed Kaju Katli for 15 Gold (+8 Sanity)"
                >
                  <span className="text-sm">💎</span>
                  <span>Kaju Katli (15g)</span>
                </motion.button>
              </div>
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
