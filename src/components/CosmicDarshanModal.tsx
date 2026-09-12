"use client";

import React, { useEffect, useState, useCallback } from "react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

interface IncentiveReward {
  day: number;
  title: string;
  description: string;
  type: "GOLD" | "XP" | "FOOD" | "PET" | "TITLE" | "ITEM";
  icon: string;
  isMilestone: boolean;
  value?: number;
}

interface CosmicDarshanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: (userUpdate: {
    gold: number;
    xp: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    title: string;
    level: number;
    loginDayCount: number;
  }) => void;
}

export default function CosmicDarshanModal({
  isOpen,
  onClose,
  onClaimSuccess,
}: CosmicDarshanModalProps) {
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [rewards, setRewards] = useState<IncentiveReward[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/daily-incentives");
      const data = await res.json();
      if (res.ok) {
        setCurrentDay(data.currentDay || 1);
        setCanClaimToday(Boolean(data.canClaimToday));
        setClaimedDays(data.claimedDays || []);
        setRewards(data.rewards || []);
      }
    } catch {
      setErrorMsg("Failed to synchronize with the Cosmic Darshan shrine.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen, fetchStatus]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const todayReward = rewards.find((r) => r.day === currentDay) || rewards[0];

  const handleClaim = async () => {
    if (claiming || !canClaimToday) return;
    setClaiming(true);
    setErrorMsg(null);
    soundFx.play("spell");

    try {
      const res = await fetch("/api/daily-incentives", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "The cosmic shrine resisted.");
        soundFx.play("faint");
        return;
      }

      setClaimedDays((prev) => [...prev, currentDay]);
      setCanClaimToday(false);

      if (todayReward?.isMilestone) {
        soundFx.play("achievement");
        spawnCombatText(`COSMIC MILESTONE: ${data.reward.title}!`, "crit");
      } else {
        soundFx.play("coin");
        spawnCombatText(`Claimed: ${data.reward.title}`, "gold");
      }

      if (data.user) {
        onClaimSuccess(data.user);
      }
    } catch {
      setErrorMsg("Failed to commune with the cosmic shrine.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Outer Double-Bezel Frame */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#0b0e14] border-2 border-amber-600/50 shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)_inset] p-1.5 flex flex-col overflow-hidden">
        {/* Inner Shrine Panel */}
        <div className="relative rounded-xl bg-gradient-to-b from-[#141b25] via-[#0d121a] to-[#070a0f] p-6 border border-white/5 flex flex-col overflow-hidden flex-1">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-amber-600/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                🕉️
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                    COSMIC DARSHAN
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60">
                    50-DAY SHRINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Consecutive daily presence at the temple yields legendary blessings, companion beasts, and sovereign armaments.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700 transition"
            >
              ✕
            </button>
          </div>

          {/* Today's Offering Spotlight Banner */}
          {todayReward && (
            <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-black/60 border border-amber-400/60 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                  {todayReward.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                      Day {todayReward.day} Offering:
                    </span>
                    {todayReward.isMilestone && (
                      <span className="text-[9px] bg-amber-400 text-black px-1.5 rounded font-black tracking-wide">
                        ★ SACRED MILESTONE
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white tracking-wide font-serif">
                    {todayReward.title}
                  </h3>
                  <p className="text-xs text-slate-300">{todayReward.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {canClaimToday ? (
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="btn-gold text-xs px-6 py-2.5 flex items-center gap-2 shadow-lg animate-pulse"
                  >
                    <span>{claiming ? "Communing..." : "Claim Darshan Offering"}</span>
                    <span>🙏</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                    <span>✓</span> OFFERING RECEIVED FOR TODAY
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs font-mono text-rose-400 bg-rose-950/60 border border-rose-800/80 px-3 py-1.5 rounded-lg mb-3">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 50-Day Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 scrollbar-thin">
              {rewards.map((r) => {
                const isClaimed = claimedDays.includes(r.day);
                const isCurrent = r.day === currentDay;

                return (
                  <div
                    key={r.day}
                    className={`p-2 rounded-lg border flex flex-col items-center text-center justify-between transition-all relative ${
                      isClaimed
                        ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-300"
                        : isCurrent
                        ? "bg-amber-950/60 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse"
                        : r.isMilestone
                        ? "bg-sky-950/40 border-sky-800/60 text-sky-300"
                        : "bg-slate-950/50 border-slate-800/60 text-slate-500 opacity-70"
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold leading-none mb-1">
                      DAY {r.day}
                    </span>

                    <div className="text-xl my-0.5 drop-shadow-sm">{r.icon}</div>

                    <span className="text-[10px] font-mono font-bold truncate max-w-full px-0.5">
                      {isClaimed ? "✓ Claimed" : r.isMilestone ? "★ Milestone" : r.type}
                    </span>

                    {isCurrent && !isClaimed && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Lore */}
          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>🪔 Check in every day to advance through the 50 cosmic offerings.</span>
            <button onClick={onClose} className="text-amber-400 hover:text-amber-300 font-bold">
              Return to Realm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
