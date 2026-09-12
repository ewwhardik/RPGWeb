"use client";

import React, { useEffect, useState } from "react";

export interface CombatTextEventDetail {
  id: string;
  text: string;
  x: number;
  y: number;
  type: "xp" | "gold" | "crit" | "mana" | "damage" | "shard" | "vedic";
}

export function spawnCombatText(
  text: string,
  type: "xp" | "gold" | "crit" | "mana" | "damage" | "shard" | "vedic" = "xp",
  coords?: { x: number; y: number }
) {
  if (typeof window === "undefined") return;

  const x = coords?.x ?? window.innerWidth / 2 + (Math.random() * 80 - 40);
  const y = coords?.y ?? window.innerHeight / 2 + (Math.random() * 60 - 30);

  const detail: CombatTextEventDetail = {
    id: `${Date.now()}-${Math.random()}`,
    text,
    x,
    y,
    type,
  };

  window.dispatchEvent(new CustomEvent("karmaraj:combat-text", { detail }));
}

export default function FloatingCombatText() {
  const [floaters, setFloaters] = useState<CombatTextEventDetail[]>([]);

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const custom = e as CustomEvent<CombatTextEventDetail>;
      if (!custom.detail) return;
      setFloaters((prev) => [...prev.slice(-15), custom.detail]);
    };

    window.addEventListener("karmaraj:combat-text", handleEvent);
    return () => {
      window.removeEventListener("karmaraj:combat-text", handleEvent);
    };
  }, []);

  // Clean up floaters
  useEffect(() => {
    if (floaters.length === 0) return;
    const timer = setTimeout(() => {
      setFloaters((prev) => prev.slice(1));
    }, 1100);
    return () => clearTimeout(timer);
  }, [floaters]);

  const getTypeStyles = (type: CombatTextEventDetail["type"]) => {
    switch (type) {
      case "vedic":
        return "text-amber-300 text-xl font-black drop-shadow-[0_0_16px_rgba(245,158,11,1)] animate-bounce tracking-widest uppercase border-y border-amber-400/60 py-0.5 px-2 bg-stone-950/80 rounded-md shadow-2xl";
      case "crit":
        return "text-red-400 text-xl font-black drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-bounce tracking-wide";
      case "xp":
        return "text-amber-300 text-lg font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]";
      case "gold":
        return "text-yellow-400 text-lg font-extrabold drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]";
      case "shard":
        return "text-violet-300 text-lg font-bold drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]";
      case "mana":
        return "text-cyan-300 text-base font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]";
      case "damage":
        return "text-rose-500 text-lg font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]";
      default:
        return "text-amber-300 text-base font-bold";
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[99998] overflow-hidden select-none">
      {floaters.map((item) => (
        <div
          key={item.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 font-mono pointer-events-none animate-combat-float ${getTypeStyles(
            item.type
          )}`}
          style={{
            left: item.x,
            top: item.y,
          }}
        >
          {item.type === "vedic" && <span>🔱</span>}
          {item.type === "crit" && <span>⚡</span>}
          {item.type === "gold" && <span>🪙</span>}
          {item.type === "shard" && <span>⏳</span>}
          {item.type === "mana" && <span>🔮</span>}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
