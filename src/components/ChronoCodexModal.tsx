"use client";

import React, { useEffect, useState, useCallback } from "react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

interface CodexTierReward {
  tier: number;
  shardsRequired: number;
  title: string;
  type: "GOLD" | "XP" | "PET" | "TITLE" | "ITEM" | "FOOD";
  description: string;
  icon: string;
  isMilestone: boolean;
}

interface ChronoCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  chronoShards: number;
  onRewardClaimed: (userUpdate: {
    gold: number;
    xp: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    title: string;
    level: number;
  }) => void;
}

export default function ChronoCodexModal({
  isOpen,
  onClose,
  chronoShards,
  onRewardClaimed,
}: ChronoCodexModalProps) {
  const [loading, setLoading] = useState(true);
  const [seasonName, setSeasonName] = useState("Season 1: Citadel of the Void");
  const [tiers, setTiers] = useState<CodexTierReward[]>([]);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([]);
  const [claimingTier, setClaimingTier] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCodexData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/codex");
      const data = await res.json();
      if (res.ok) {
        setSeasonName(data.seasonName);
        setTiers(data.tiers);
        setClaimedTiers(data.claimedTiers || []);
      }
    } catch {
      setErrorMsg("Failed to synchronize with Chrono-Codex.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCodexData();
    }
  }, [isOpen, fetchCodexData]);

  if (!isOpen) return null;

  const currentTier = Math.min(30, Math.floor(chronoShards / 100));
  const progressInTier = chronoShards >= 3000 ? 100 : chronoShards % 100;

  const handleClaimTier = async (tierNumber: number) => {
    if (claimingTier) return;
    setClaimingTier(tierNumber);
    setErrorMsg(null);
    soundFx.play("spell");

    try {
      const res = await fetch("/api/codex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to claim tier.");
        soundFx.play("faint");
        return;
      }

      setClaimedTiers((prev) => [...prev, tierNumber]);

      if (data.reward?.isMilestone) {
        soundFx.play("achievement");
        spawnCombatText(`SEASON MILESTONE: ${data.reward.title}!`, "crit");
      } else {
        soundFx.play("coin");
        spawnCombatText(`Claimed: ${data.reward.title}`, "gold");
      }

      if (data.user) {
        onRewardClaimed(data.user);
      }
    } catch {
      setErrorMsg("Failed to communicate with citadel archives.");
    } finally {
      setClaimingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Outer Double-Bezel Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#0b0e14] border-2 border-[#28374d] shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)_inset] p-1.5 flex flex-col overflow-hidden">
        {/* Inner Panel */}
        <div className="relative rounded-xl bg-gradient-to-b from-[#121822] to-[#0a0d13] p-6 border border-white/5 flex flex-col overflow-hidden flex-1">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">⏳</span>
                <h2 className="text-2xl font-black text-amber-400 tracking-wide font-serif drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                  {seasonName.toUpperCase()}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-950/80 text-violet-300 border border-violet-800/60">
                  BATTLE PASS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Complete daily quests, habits, and to-dos to earn Chrono-Shards and unlock 30 tiers of legendary seasonal rewards.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700 transition"
            >
              ✕
            </button>
          </div>

          {/* Season Progress Header Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 bg-slate-900/80 rounded-xl p-3.5 border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Current Tier:</span>
              <span className="text-xl font-black text-white font-mono flex items-center gap-1.5">
                <span className="text-amber-400">TIER {currentTier}</span>
                <span className="text-xs text-slate-400">/ 30</span>
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                <span className="text-violet-300">⏳ {chronoShards} SHARDS</span>
                <span className="text-slate-400">{progressInTier} / 100 TO NEXT</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressInTier}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:items-end justify-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Season Ends In:</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded mt-0.5">
                📅 28 DAYS REMAINING
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs font-mono text-rose-400 bg-rose-950/60 border border-rose-800/80 px-3 py-1.5 rounded-lg mb-3">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 30 Tiers Grid / List */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-16 text-xs font-mono text-slate-400 animate-pulse">
              Consulting the ancient chronographs...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[50vh] scrollbar-thin">
              {tiers.map((t) => {
                const isUnlocked = chronoShards >= t.shardsRequired;
                const isClaimed = claimedTiers.includes(t.tier);
                const canClaim = isUnlocked && !isClaimed;

                return (
                  <div
                    key={t.tier}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      t.isMilestone
                        ? isUnlocked
                          ? "bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950 border-amber-500/60 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                          : "bg-gradient-to-r from-slate-900 to-slate-950 border-purple-900/50"
                        : isUnlocked
                        ? "bg-slate-900/90 border-slate-700"
                        : "bg-slate-950/60 border-slate-800/60 opacity-60"
                    }`}
                  >
                    {/* Left Info */}
                    <div className="flex items-center gap-3">
                      {/* Tier Badge */}
                      <div
                        className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center text-xs font-black font-mono border flex-shrink-0 ${
                          t.isMilestone
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                            : isUnlocked
                            ? "bg-slate-800 border-slate-600 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-500"
                        }`}
                      >
                        <span className="text-[9px] uppercase leading-none">TIER</span>
                        <span className="text-sm leading-none mt-0.5">{t.tier}</span>
                      </div>

                      {/* Icon */}
                      <div className="text-2xl drop-shadow-md flex-shrink-0">{t.icon}</div>

                      {/* Title & Description */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-black tracking-wide ${
                              t.isMilestone
                                ? "text-amber-300 font-serif"
                                : isUnlocked
                                ? "text-white"
                                : "text-slate-400"
                            }`}
                          >
                            {t.title}
                          </h4>
                          {t.isMilestone && (
                            <span className="text-[9px] font-black font-mono uppercase bg-amber-400 text-black px-1.5 py-0.2 rounded shadow-sm">
                              MILESTONE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                      </div>
                    </div>

                    {/* Right Claim Action / Status */}
                    <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                      <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                        ({t.shardsRequired} Shards)
                      </span>

                      {isClaimed ? (
                        <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <span>✓</span> CLAIMED
                        </div>
                      ) : canClaim ? (
                        <button
                          onClick={() => handleClaimTier(t.tier)}
                          disabled={claimingTier === t.tier}
                          className="btn-gold text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-lg animate-pulse"
                        >
                          <span>{claimingTier === t.tier ? "Claiming..." : "Claim Reward"}</span>
                          <span>🎁</span>
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs flex items-center gap-1.5">
                          <span>🔒</span>
                          <span>{t.shardsRequired - chronoShards} More</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Info */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>⚔️ Shards are gained automatically by scoring tasks: Habits (+5), Dailies (+10), Todos (+15).</span>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300 font-bold"
            >
              Return to Realm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
