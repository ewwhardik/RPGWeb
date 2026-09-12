"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  X,
  Users,
  Plus,
  Coins,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { ChallengeTaskTemplate } from "@/lib/challenges";

interface ChallengeData {
  id: string;
  name: string;
  description: string;
  category: string;
  prizePool: number;
  creatorId: string;
  participantCount: number;
  isJoined: boolean;
  tasks: ChallengeTaskTemplate[];
}

interface GuildChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksChanged?: () => void;
}

export default function GuildChallengesModal({
  isOpen,
  onClose,
  onTasksChanged,
}: GuildChallengesModalProps) {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Create Challenge form toggle
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [newPrizePool, setNewPrizePool] = useState(250);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/challenges");
      const data = await res.json();
      if (res.ok) {
        setChallenges(data.challenges || []);
      }
    } catch {
      setActionError("Failed to reach the herald's bounty board.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActionError("");
      setActionSuccess("");
      fetchChallenges();
    }
  }, [isOpen, fetchChallenges]);

  if (!isOpen) return null;

  async function handleJoin(challengeId: string) {
    soundFx.playLevelUp();
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "JOIN", challengeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message);
        fetchChallenges();
        if (onTasksChanged) onTasksChanged();
      } else {
        setActionError(data.error || "Failed to enlist in challenge.");
      }
    } catch {
      setActionError("Failed to connect with the challenge board.");
    }
  }

  async function handleLeave(challengeId: string) {
    soundFx.playClick();
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LEAVE", challengeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message);
        fetchChallenges();
        if (onTasksChanged) onTasksChanged();
      }
    } catch {
      setActionError("Failed to withdraw from challenge.");
    }
  }

  async function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundFx.playLevelUp();
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          name: newTitle.trim(),
          description: newDescription.trim(),
          category: newCategory,
          prizePool: newPrizePool,
          tasks: [
            {
              title: `${newTitle.trim()} Primary Habit`,
              type: "DAILY",
              category: newCategory,
              difficulty: "MEDIUM",
              repeatDays: "0,1,2,3,4,5,6",
            },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message);
        setIsCreating(false);
        setNewTitle("");
        setNewDescription("");
        fetchChallenges();
        if (onTasksChanged) onTasksChanged();
      } else {
        setActionError(data.error || "Failed to post challenge.");
      }
    } catch {
      setActionError("Failed to register challenge.");
    }
  }

  const filteredChallenges =
    selectedCategory === "ALL"
      ? challenges
      : challenges.filter((c) => c.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-stone-900 via-neutral-900 to-black border-2 border-stone-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Bezel inner highlight */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-amber-500/20 shadow-inner" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center shadow-lg border border-amber-400/40 text-amber-200">
              <Trophy className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-100 tracking-wide flex items-center gap-2">
                Guild Community Challenges
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  Bounty Board
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Join community protocols, sync heroic habits, and claim bounty gold pools.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsCreating(!isCreating);
              }}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> {isCreating ? "Browse" : "Inscribe Challenge"}
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {actionError && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-red-950/70 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            {actionSuccess}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isCreating ? (
            /* CREATE CHALLENGE FORM */
            <form onSubmit={handleCreateChallenge} className="space-y-4 p-5 rounded-xl bg-stone-950/70 border border-stone-800">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Flame className="w-4 h-4" /> Inscribe New Community Challenge
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 21-Day Cold Shower & Discipline Protocol"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Description & Narrative
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Explain the rules and psychological power of this challenge..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                      Stat Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="GENERAL">General</option>
                      <option value="STRENGTH">Strength</option>
                      <option value="INTELLECT">Intellect</option>
                      <option value="VITALITY">Vitality</option>
                      <option value="DEXTERITY">Dexterity</option>
                      <option value="SANITY">Sanity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                      Prize Pool (Gold)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={2000}
                      value={newPrizePool}
                      onChange={(e) => setNewPrizePool(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 text-stone-400 text-xs hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md"
                >
                  Post to Bounty Board
                </button>
              </div>
            </form>
          ) : (
            /* CHALLENGE DIRECTORY */
            <>
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["ALL", "SANITY", "VITALITY", "INTELLECT", "STRENGTH", "DEXTERITY"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm"
                        : "bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="py-16 text-center text-stone-400 text-xs flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  Reading herald charters...
                </div>
              ) : filteredChallenges.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs border border-dashed border-stone-800 rounded-xl">
                  No community challenges currently posted under this discipline.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredChallenges.map((challenge) => {
                    const isExpanded = expandedChallengeId === challenge.id;

                    return (
                      <div
                        key={challenge.id}
                        className={`rounded-xl border transition-all p-4 ${
                          challenge.isJoined
                            ? "bg-emerald-950/20 border-emerald-700/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-stone-950/80 border-stone-800 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300">
                                {challenge.category}
                              </span>
                              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5" /> {challenge.prizePool} Gold Bounty
                              </span>
                              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" /> {challenge.participantCount} adventurers
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-stone-100 mt-1">
                              {challenge.name}
                            </h4>
                            <p className="text-xs text-stone-400 leading-relaxed">
                              {challenge.description}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {challenge.isJoined ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Enlisted
                                </span>
                                <button
                                  onClick={() => handleLeave(challenge.id)}
                                  className="text-[11px] text-stone-500 hover:text-red-400 underline"
                                >
                                  Leave
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleJoin(challenge.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1"
                              >
                                Accept Challenge
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Cloned Tasks Preview */}
                        {challenge.tasks && challenge.tasks.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-stone-800/80">
                            <button
                              onClick={() =>
                                setExpandedChallengeId(isExpanded ? null : challenge.id)
                              }
                              className="text-[11px] text-stone-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              {challenge.tasks.length} Included Protocol Tasks
                            </button>

                            {isExpanded && (
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in duration-150">
                                {challenge.tasks.map((task, i) => (
                                  <div
                                    key={i}
                                    className="p-2 rounded-lg bg-stone-900/60 border border-stone-800 text-[11px] flex items-center justify-between"
                                  >
                                    <span className="text-stone-300 truncate font-medium">
                                      {task.title}
                                    </span>
                                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                                      {task.type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
