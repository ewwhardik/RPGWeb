"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Crown,
  Medal,
  Shield,
  Search,
  RotateCw,
  Sparkles,
  Axe,
  Wand2,
  Sword,
  Compass,
  Star,
  UserCheck,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  title: string;
  avatar: string;
  characterClass: string;
  level: number;
  xp: number;
  streakCount: number;
  tasksCompletedCount: number;
  prestigeLevel: number;
  isCurrentUser: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername?: string;
}

const AVATAR_ICONS: Record<string, React.ElementType> = {
  warrior: Axe,
  mage: Wand2,
  rogue: Sword,
  paladin: Shield,
  scout: Compass,
};

export default function LeaderboardModal({
  isOpen,
  onClose,
  currentUsername,
}: LeaderboardModalProps) {
  const [category, setCategory] = useState<"streak" | "xp" | "tasks">("streak");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserStats, setCurrentUserStats] = useState<LeaderboardEntry | null>(null);
  const [totalContenders, setTotalContenders] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async (cat: "streak" | "xp" | "tasks", showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/leaderboard?category=${cat}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLeaderboard(data.leaderboard || []);
        setCurrentUserRank(data.currentUserRank || null);
        setCurrentUserStats(data.currentUserStats || null);
        setTotalContenders(data.totalContenders || 0);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard(category);
    }
  }, [isOpen, category, fetchLeaderboard]);

  // Live auto-refresh every 20 seconds while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      fetchLeaderboard(category, false);
    }, 20000);
    return () => clearInterval(interval);
  }, [isOpen, category, fetchLeaderboard]);

  if (!isOpen) return null;

  const handleManualRefresh = () => {
    soundFx.playClick();
    fetchLeaderboard(category, false);
  };

  const filteredEntries = leaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    entry.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const top3 = leaderboard.slice(0, 3);
  const remaining = filteredEntries.filter((e) => !top3.some((t) => t.id === e.id) || searchQuery.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0e1217] border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100 max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-[#13171f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-title text-amber-300">
                  Hall of Masters
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Real-time consistency & discipline ranking across the kingdom
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-amber-300 hover:border-amber-500 transition-all active:scale-95"
              title="Refresh Leaderboard"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Search */}
        <div className="p-4 sm:px-6 bg-[#11151c] border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-stone-900/90 rounded-2xl border border-stone-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setCategory("streak");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                category === "streak"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md scale-102"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>The Consistent (Streaks)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setCategory("xp");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                category === "xp"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md scale-102"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Wisdom & Karma (XP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setCategory("tasks");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                category === "tasks"
                  ? "bg-gradient-to-r from-amber-500 to-emerald-500 text-stone-950 shadow-md scale-102"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quest Masters (Tasks)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hero or title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Scrollable Leaderboard Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top 3 Podium (Shown when not filtering by search) */}
          {searchQuery.trim().length === 0 && top3.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end pt-2">
              {/* RANK 2: SILVER CREST */}
              <div className="order-2 sm:order-1 p-4 rounded-2xl bg-[#141822] border-2 border-slate-400/30 flex flex-col items-center text-center shadow-lg relative">
                <div className="w-8 h-8 rounded-full bg-slate-300 text-stone-950 font-black flex items-center justify-center text-sm font-mono shadow-md mb-2">
                  2
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-400/10 border border-slate-400/40 flex items-center justify-center text-slate-300 mb-2">
                  {(() => {
                    const Icon = AVATAR_ICONS[top3[1].avatar] || Shield;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div className="font-bold text-sm text-stone-100 flex items-center gap-1">
                  <span>{top3[1].username}</span>
                  {top3[1].isCurrentUser && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                      YOU
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 truncate max-w-full">{top3[1].title}</p>
                <div className="mt-2.5 flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-stone-900 text-red-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" /> {top3[1].streakCount}d
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-bold">
                    Lvl {top3[1].level}
                  </span>
                </div>
              </div>

              {/* RANK 1: GOLD CROWN (CHAMPION) */}
              <div className="order-1 sm:order-2 p-5 rounded-2xl bg-gradient-to-b from-[#231b12] to-[#161a22] border-2 border-amber-400/60 flex flex-col items-center text-center shadow-[0_0_25px_rgba(245,158,11,0.25)] relative transform sm:-translate-y-2">
                <div className="absolute -top-3 flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-black text-xs shadow-md">
                  <Crown className="w-3.5 h-3.5 text-stone-950" />
                  <span>KINGDOM CHAMPION</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-black flex items-center justify-center text-base font-mono shadow-md mb-2 mt-1">
                  1
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/70 flex items-center justify-center text-amber-300 mb-2 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  {(() => {
                    const Icon = AVATAR_ICONS[top3[0].avatar] || Crown;
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>
                <div className="font-black text-base text-amber-300 flex items-center gap-1.5">
                  <span>{top3[0].username}</span>
                  {top3[0].isCurrentUser && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                      YOU
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-200/80 font-medium truncate max-w-full">{top3[0].title}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-stone-950/80 border border-red-500/40 text-red-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-400" /> {top3[0].streakCount}d streak
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-stone-950/80 border border-amber-500/40 text-amber-300 font-bold">
                    Lvl {top3[0].level}
                  </span>
                </div>
              </div>

              {/* RANK 3: BRONZE SHIELD */}
              <div className="order-3 p-4 rounded-2xl bg-[#171418] border-2 border-amber-700/30 flex flex-col items-center text-center shadow-lg relative">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-stone-100 font-black flex items-center justify-center text-sm font-mono shadow-md mb-2">
                  3
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-700/15 border border-amber-700/40 flex items-center justify-center text-amber-500 mb-2">
                  {(() => {
                    const Icon = AVATAR_ICONS[top3[2].avatar] || Shield;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div className="font-bold text-sm text-stone-100 flex items-center gap-1">
                  <span>{top3[2].username}</span>
                  {top3[2].isCurrentUser && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                      YOU
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 truncate max-w-full">{top3[2].title}</p>
                <div className="mt-2.5 flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-stone-900 text-red-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" /> {top3[2].streakCount}d
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-bold">
                    Lvl {top3[2].level}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table Rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-3 pb-1 border-b border-stone-800">
              <span className="w-12">RANK</span>
              <span className="flex-1">ADVENTURER</span>
              <span className="hidden sm:inline-block w-28 text-center">CLASS & TITLE</span>
              <span className="w-24 text-center">STREAK</span>
              <span className="w-24 text-right">KARMA & LVL</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-stone-400 font-mono flex flex-col items-center gap-2">
                <RotateCw className="w-6 h-6 animate-spin text-amber-400" />
                <span>Consulting the cosmic ledger of deeds...</span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 font-mono">
                No adventurers match your search rune.
              </div>
            ) : (
              (searchQuery.trim().length > 0 ? filteredEntries : remaining).map((entry) => {
                const Icon = AVATAR_ICONS[entry.avatar] || Shield;
                const isUser = entry.isCurrentUser || entry.username === currentUsername;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      isUser
                        ? "bg-amber-500/10 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        : "bg-stone-900/50 border-stone-800/80 hover:border-stone-700"
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="w-12 flex items-center">
                      <span
                        className={`text-xs font-mono font-black ${
                          entry.rank === 1
                            ? "text-amber-400"
                            : entry.rank === 2
                            ? "text-slate-300"
                            : entry.rank === 3
                            ? "text-amber-600"
                            : "text-stone-400"
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </div>

                    {/* Adventurer Identity */}
                    <div className="flex-1 flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                            {entry.username}
                          </span>
                          {isUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-black">
                              YOU
                            </span>
                          )}
                          {entry.prestigeLevel > 0 && (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center">
                              ★{entry.prestigeLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 truncate sm:hidden">{entry.title}</p>
                      </div>
                    </div>

                    {/* Class & Title (Desktop) */}
                    <div className="hidden sm:flex flex-col items-center w-28 text-center">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                        {entry.characterClass}
                      </span>
                      <span className="text-[10px] text-stone-400 truncate max-w-[110px]">
                        {entry.title}
                      </span>
                    </div>

                    {/* Streak / Consistency */}
                    <div className="w-24 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-red-400">
                        <Flame className="w-3.5 h-3.5 text-red-500" />
                        <span>{entry.streakCount}d</span>
                      </div>
                      <span className="text-[9px] text-stone-500 font-mono">
                        {entry.tasksCompletedCount} quests
                      </span>
                    </div>

                    {/* Karma & Level */}
                    <div className="w-24 text-right">
                      <div className="text-xs font-mono font-bold text-amber-300">
                        Lvl {entry.level}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        {entry.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sticky User Standing Banner */}
        {currentUserStats && (
          <div className="p-3 sm:px-6 bg-[#141822] border-t border-amber-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span className="text-stone-300">YOUR KINGDOM RANK:</span>
              <span className="text-amber-400 font-bold text-sm">
                #{currentUserRank || "—"} of {totalContenders}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500" /> {currentUserStats.streakCount} Day Streak
              </span>
              <span className="text-emerald-400 font-bold hidden sm:inline">
                {currentUserStats.tasksCompletedCount} Quests Succeeded
              </span>
              <span className="text-amber-300 font-bold">
                Lvl {currentUserStats.level}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
