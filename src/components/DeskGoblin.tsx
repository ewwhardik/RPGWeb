"use client";

import React, { useState } from "react";
import { Cookie, MessageCircle, X } from "lucide-react";
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
  const [isWiggling, setIsWiggling] = useState(false);

  function handlePoke() {
    soundFx.playClick();
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 400);
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
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 600);
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
      <button
        type="button"
        onClick={() => {
          soundFx.playClick();
          setIsOpen(true);
        }}
        className="fixed bottom-4 right-4 z-40 bg-[#141b24] border border-amber-600/70 p-2.5 rounded-full shadow-2xl flex items-center gap-2 text-amber-400 hover:scale-105 transition-transform"
        title="Summon Bartholomew the Desk Goblin"
      >
        <span className="text-xl">👺</span>
        <span className="text-xs font-bold text-slate-200 pr-1">Bartholomew</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 rpg-panel border border-amber-600/50 bg-[#121822] p-3.5 shadow-2xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-2">
          <div
            onClick={handlePoke}
            className={`cursor-pointer select-none text-2xl transition-transform ${
              isWiggling ? "scale-125 rotate-12" : "hover:scale-110"
            }`}
            title="Poke Bartholomew"
          >
            👺
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300">Bartholomew</h4>
            <span className="text-[10px] text-slate-400">Desk Goblin in Residence</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setIsOpen(false);
          }}
          className="text-slate-400 hover:text-slate-200 p-1"
          title="Minimize Goblin"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Speech Bubble */}
      <div className="p-2.5 bg-[#0b0e14] rounded-lg border border-slate-800 text-xs text-slate-200 mb-3 leading-relaxed relative">
        <p>{dialogue}</p>
        <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[#0b0e14] border-t border-l border-slate-800 rotate-45" />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePoke}
          className="btn-dark text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1"
        >
          <MessageCircle className="w-3 h-3 text-slate-400" />
          <span>Poke Goblin</span>
        </button>

        <button
          type="button"
          onClick={handleFeed}
          disabled={feeding || gold < 5}
          className="btn-gold text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1"
          title="Feeds Bartholomew for 5 Gold (+2 Sanity)"
        >
          <Cookie className="w-3 h-3" />
          <span>Feed (5g)</span>
        </button>
      </div>
    </div>
  );
}
