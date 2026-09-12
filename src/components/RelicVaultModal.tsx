"use client";

import React, { useState } from "react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

interface RelicReward {
  type: "FOOD" | "EQUIPMENT" | "CODEX";
  title: string;
  description: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  icon: string;
  bonus: string;
  isPity: boolean;
}

interface RelicVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGold: number;
  vaultPulls: number;
  onPullSuccess: (userUpdate: {
    gold: number;
    xp: number;
    level: number;
    mp: number;
    maxMp: number;
    vaultPulls: number;
    chronoShards: number;
  }) => void;
}

export default function RelicVaultModal({
  isOpen,
  onClose,
  userGold,
  vaultPulls,
  onPullSuccess,
}: RelicVaultModalProps) {
  const [chestState, setChestState] = useState<"idle" | "rumbling" | "revealed">("idle");
  const [reward, setReward] = useState<RelicReward | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPulls, setCurrentPulls] = useState(vaultPulls);

  if (!isOpen) return null;

  const pityCount = currentPulls % 10;
  const isPityReady = pityCount === 9;

  const handleOpenVault = async () => {
    if (userGold < 100) {
      setErrorMsg("You lack the required 100 Gold to open the ancient vault!");
      soundFx.play("faint");
      return;
    }

    setErrorMsg(null);
    setChestState("rumbling");
    soundFx.play("spell");

    try {
      const res = await fetch("/api/vault/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "The vault tumblers resisted.");
        setChestState("idle");
        soundFx.play("faint");
        return;
      }

      // Allow rumble animation to play for 1.1s for tension
      setTimeout(() => {
        setReward(data.reward);
        setCurrentPulls(data.vaultPulls);
        setChestState("revealed");

        if (data.reward.rarity === "LEGENDARY" || data.reward.rarity === "EPIC") {
          soundFx.play("achievement");
          spawnCombatText(`LEGENDARY LOOT: ${data.reward.title}!`, "crit");
        } else {
          soundFx.play("loot");
          spawnCombatText(data.reward.bonus, "xp");
        }

        if (data.user) {
          onPullSuccess(data.user);
        }
      }, 1100);
    } catch {
      setErrorMsg("Connection to the ancient vault severed.");
      setChestState("idle");
    }
  };

  const resetToIdle = () => {
    setChestState("idle");
    setReward(null);
    setErrorMsg(null);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY":
        return "bg-gradient-to-r from-amber-500 to-yellow-300 text-black border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.8)]";
      case "EPIC":
        return "bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white border-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.8)]";
      case "RARE":
        return "bg-gradient-to-r from-sky-600 to-cyan-500 text-white border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.7)]";
      default:
        return "bg-slate-700 text-slate-200 border-slate-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Outer Double-Bezel Frame */}
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0b0e14] border-2 border-[#28374d] shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)_inset] p-1.5 overflow-hidden">
        {/* Inner Panel */}
        <div className="relative rounded-xl bg-gradient-to-b from-[#121822] to-[#0a0d13] p-6 border border-white/5 flex flex-col items-center text-center">
          {/* Header Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700 transition"
          >
            ✕
          </button>

          {/* Title & Lore */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🗝️</span>
            <h2 className="text-2xl font-black text-amber-400 tracking-wide font-serif drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              THE RELIC VAULT
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md mb-5 font-mono">
            Sacrifice 100 Gold to invoke the ancient mechanist chest. Yields rare beast feeds, ancient arcane codices, or fabled armaments.
          </p>

          {/* Pity Progress Gauge */}
          <div className="w-full bg-slate-900/90 rounded-lg p-3 border border-slate-800 mb-6 text-left shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span>⚡ PITY HARMONY:</span>
                <span className={isPityReady ? "text-amber-400 animate-pulse" : "text-slate-400"}>
                  {pityCount} / 10 Pulls
                </span>
              </span>
              <span className="text-amber-400 text-[11px]">
                {isPityReady ? "★ GUARANTEED EPIC/LEGENDARY ON NEXT PULL!" : `${10 - pityCount} pulls to guarantee`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isPityReady
                    ? "bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-pulse"
                    : "bg-gradient-to-r from-amber-600 to-amber-400"
                }`}
                style={{ width: `${(pityCount / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Interactive Chest Visualizer */}
          <div className="relative w-64 h-56 flex items-center justify-center my-2">
            {/* Background Glow Aura */}
            <div
              className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
                chestState === "revealed"
                  ? reward?.rarity === "LEGENDARY"
                    ? "bg-amber-400/35 opacity-100 animate-pulse"
                    : reward?.rarity === "EPIC"
                    ? "bg-purple-500/35 opacity-100 animate-pulse"
                    : "bg-cyan-500/30 opacity-100"
                  : chestState === "rumbling"
                  ? "bg-amber-500/20 opacity-80"
                  : "bg-amber-500/5 opacity-50"
              }`}
            />

            {chestState === "idle" && (
              <div className="flex flex-col items-center group cursor-pointer" onClick={handleOpenVault}>
                <div className="w-36 h-32 rounded-xl bg-gradient-to-b from-amber-900/60 to-slate-950 border-2 border-amber-600/60 flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.8)] transform group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300">
                  <div className="relative text-6xl select-none drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                    📦
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-amber-400/80 mt-3 tracking-widest uppercase group-hover:text-amber-300">
                  Click or press button to crack lock
                </span>
              </div>
            )}

            {chestState === "rumbling" && (
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-36 h-32 rounded-xl bg-gradient-to-b from-amber-600/40 to-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.8)] scale-110">
                  <span className="text-6xl animate-spin">🗝️</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 mt-4 tracking-widest uppercase animate-pulse">
                  Unsealing cosmic relics...
                </span>
              </div>
            )}

            {chestState === "revealed" && reward && (
              <div className="flex flex-col items-center animate-scale-up w-full px-2">
                <div
                  className={`w-full p-4 rounded-xl border-2 flex flex-col items-center shadow-2xl relative ${
                    reward.rarity === "LEGENDARY"
                      ? "bg-gradient-to-b from-amber-950/90 to-slate-950 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]"
                      : reward.rarity === "EPIC"
                      ? "bg-gradient-to-b from-purple-950/90 to-slate-950 border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.5)]"
                      : "bg-gradient-to-b from-sky-950/80 to-slate-950 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                  }`}
                >
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border mb-2 ${getRarityBadge(
                      reward.rarity
                    )}`}
                  >
                    {reward.isPity ? `★ PITY BONUS: ${reward.rarity}` : reward.rarity}
                  </span>

                  <div className="text-4xl my-1 drop-shadow-md">
                    {reward.type === "FOOD" ? "🍖" : reward.type === "CODEX" ? "📜" : "⚔️"}
                  </div>

                  <h3 className="text-lg font-black text-white tracking-wide font-serif mb-1">
                    {reward.title}
                  </h3>

                  <p className="text-xs text-slate-300 mb-2 italic px-2">
                    &ldquo;{reward.description}&rdquo;
                  </p>

                  <div className="w-full bg-black/50 rounded-lg p-2 border border-white/10 text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-1">
                    <span>REWARD:</span>
                    <span className="text-emerald-400">{reward.bonus}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-xs font-mono text-rose-400 bg-rose-950/60 border border-rose-800/80 px-3 py-1.5 rounded-lg mb-3">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Control Actions */}
          <div className="w-full pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-2">
            <div className="text-xs font-mono text-left">
              <div className="text-slate-400">YOUR GOLD:</div>
              <div className="text-yellow-400 font-bold text-base flex items-center gap-1">
                <span>🪙</span> {userGold} G
              </div>
            </div>

            <div className="flex items-center gap-2">
              {chestState === "revealed" ? (
                <>
                  <button
                    onClick={resetToIdle}
                    className="btn-dark text-xs px-3 py-2 rounded-lg"
                  >
                    Inspect Vault
                  </button>
                  <button
                    onClick={handleOpenVault}
                    disabled={userGold < 100}
                    className="btn-gold text-xs px-4 py-2"
                  >
                    Pull Again (100 G)
                  </button>
                </>
              ) : (
                <button
                  onClick={handleOpenVault}
                  disabled={chestState === "rumbling" || userGold < 100}
                  className="btn-gold text-sm px-6 py-2.5 flex items-center gap-2"
                >
                  <span>{chestState === "rumbling" ? "Cracking..." : "Crack Vault"}</span>
                  <span className="text-xs opacity-90">(🪙 100 G)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
