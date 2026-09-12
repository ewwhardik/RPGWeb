"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Scroll,
  X,
  Sparkles,
  Trophy,
  Users,
  Clock,
  AlertCircle,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { QuestScrollDef, ActiveQuestState } from "@/lib/questEngine";

interface QuestScrollsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (userUpdates: { xp: number; gold: number; level: number; chronoShards?: number }) => void;
}

export default function QuestScrollsModal({
  isOpen,
  onClose,
  onRewardClaimed,
}: QuestScrollsModalProps) {
  const [loading, setLoading] = useState(true);
  const [inParty, setInParty] = useState(false);
  const [activeQuest, setActiveQuest] = useState<ActiveQuestState | null>(null);
  const [activeScrollDef, setActiveScrollDef] = useState<QuestScrollDef | null>(null);
  const [availableScrolls, setAvailableScrolls] = useState<QuestScrollDef[]>([]);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [selectedScrollId, setSelectedScrollId] = useState<string | null>(null);

  const fetchQuestData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quests/party");
      const data = await res.json();
      if (res.ok) {
        setInParty(Boolean(data.inParty));
        setActiveQuest(data.activeQuest);
        setActiveScrollDef(data.activeScrollDef);
        setAvailableScrolls(data.availableScrolls || []);
        setHasClaimed(Boolean(data.hasClaimed));
      }
    } catch {
      setActionError("Failed to commune with the quest archives.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActionError("");
      setActionSuccess("");
      fetchQuestData();
    }
  }, [isOpen, fetchQuestData]);

  if (!isOpen) return null;

  async function handleStartQuest(questId: string) {
    soundFx.playClick();
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/quests/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START", questId }),
      });
      const data = await res.json();
      if (res.ok) {
        soundFx.playLevelUp();
        setActionSuccess(data.message);
        fetchQuestData();
      } else {
        setActionError(data.error || "Failed to start expedition.");
      }
    } catch {
      setActionError("Arcane turbulence prevented launching the quest.");
    }
  }

  async function handleClaimSpoils() {
    soundFx.playLevelUp();
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/quests/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLAIM" }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message);
        setHasClaimed(true);
        if (data.user && onRewardClaimed) {
          onRewardClaimed(data.user);
        }
        fetchQuestData();
      } else {
        setActionError(data.error || "Failed to claim spoils.");
      }
    } catch {
      setActionError("Failed to claim quest rewards.");
    }
  }

  async function handleAbandonQuest() {
    if (!confirm("Are you certain you want to abandon the current guild quest expedition?")) return;
    soundFx.playClick();

    try {
      const res = await fetch("/api/quests/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ABANDON" }),
      });
      if (res.ok) {
        fetchQuestData();
      }
    } catch {
      setActionError("Failed to abandon quest.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-stone-900 via-neutral-900 to-black border-2 border-stone-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Outer Bezel Accent */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-amber-500/20 shadow-inner" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-lg border border-amber-400/40 text-amber-200">
              <Scroll className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-100 tracking-wide flex items-center gap-2">
                Narrative Quest Scrolls
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  Guild Expeditions
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Multi-stage story boss raids, relic collections, and legendary guild spoils.
              </p>
            </div>
          </div>

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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-stone-400 text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              Unsealing ancient parchment scrolls...
            </div>
          ) : !inParty ? (
            <div className="p-8 text-center rounded-xl bg-stone-950/60 border border-stone-800 space-y-4">
              <Users className="w-12 h-12 text-amber-400/60 mx-auto" />
              <h3 className="text-sm font-bold text-stone-200">Guild Affiliation Required</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                Quest scrolls are epic collaborative adventures undertaken with your party members.
                Join or form a guild on the Warboard to initiate these sacred expeditions.
              </p>
            </div>
          ) : activeQuest && activeScrollDef ? (
            /* ACTIVE QUEST CARD */
            <div className="space-y-4">
              <div
                className={`relative rounded-2xl p-5 border-2 border-amber-500/40 bg-gradient-to-br ${activeScrollDef.bannerGradient} shadow-2xl overflow-hidden`}
              >
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-4xl filter drop-shadow-md">{activeScrollDef.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                          {activeScrollDef.subtitle}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-stone-700 text-stone-300 font-semibold">
                          {activeScrollDef.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-stone-100 mt-0.5">
                        {activeScrollDef.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!activeQuest.isCompleted && (
                      <button
                        onClick={handleAbandonQuest}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-900/80 hover:bg-red-950 border border-stone-700 text-stone-400 hover:text-red-300 transition"
                      >
                        Abandon
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-300/90 italic mt-3 bg-black/30 p-3 rounded-lg border border-white/5 leading-relaxed">
                  &ldquo;{activeScrollDef.narrativeStory}&rdquo;
                </p>

                {/* Stages progress bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {activeScrollDef.stages[activeQuest.currentStageIndex]?.title || "Current Stage"}
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {activeQuest.progress} / {activeQuest.target}
                    </span>
                  </div>

                  {/* High-tech dual-layer progress bar */}
                  <div className="h-3 w-full bg-stone-950/80 rounded-full border border-stone-700/80 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeQuest.isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                          : "bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((activeQuest.progress / activeQuest.target) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {activeScrollDef.stages[activeQuest.currentStageIndex]?.description}
                  </p>
                </div>

                {/* Multi-stage indicators if episodic */}
                {activeScrollDef.stages.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    {activeScrollDef.stages.map((stage, idx) => {
                      const isPast = idx < activeQuest.currentStageIndex;
                      const isCurr = idx === activeQuest.currentStageIndex;
                      return (
                        <div
                          key={idx}
                          className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                            isPast
                              ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-300"
                              : isCurr
                              ? "bg-amber-950/50 border-amber-500 text-amber-200 shadow-md"
                              : "bg-stone-900/40 border-stone-800 text-stone-500"
                          }`}
                        >
                          <div className="text-[10px] font-bold uppercase">
                            Stage {idx + 1} {isPast && "✓"}
                          </div>
                          <div className="text-[11px] font-medium truncate">{stage.title}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Completion & Claiming Action */}
                {activeQuest.isCompleted && (
                  <div className="mt-5 p-4 rounded-xl bg-emerald-950/80 border-2 border-emerald-500/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-6 h-6 text-emerald-300" />
                      <div>
                        <div className="text-xs font-black text-emerald-200 uppercase tracking-wider">
                          Quest Conquered!
                        </div>
                        <div className="text-[11px] text-emerald-300/80">
                          {hasClaimed
                            ? "You have already claimed your spoils."
                            : "Claim your rewards and rare companion spoils!"}
                        </div>
                      </div>
                    </div>

                    {!hasClaimed ? (
                      <button
                        onClick={handleClaimSpoils}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-emerald-900/50 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Gift className="w-4 h-4" /> Claim Spoils
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Claimed
                      </span>
                    )}
                  </div>
                )}

                {/* Live Quest Activity Log */}
                {activeQuest.recentActivity && activeQuest.recentActivity.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1.5">
                      Guild Progress Log
                    </div>
                    <div className="space-y-1">
                      {activeQuest.recentActivity.slice(0, 3).map((act, i) => (
                        <div key={i} className="text-[11px] text-stone-300 flex items-center gap-2">
                          <span className="text-amber-400 font-semibold">{act.username}:</span>
                          <span className="text-stone-300">{act.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* NO ACTIVE QUEST - SCROLL LIBRARY */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                  Available Quest Scrolls ({availableScrolls.length})
                </h3>
                <span className="text-xs text-stone-500">
                  Select a scroll to initiate with your guild party
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableScrolls.map((scroll) => {
                  const isSelected = selectedScrollId === scroll.id;

                  return (
                    <div
                      key={scroll.id}
                      onClick={() => setSelectedScrollId(scroll.id)}
                      className={`relative rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "bg-gradient-to-b from-stone-800 to-stone-900 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          : "bg-stone-950/80 border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{scroll.icon}</span>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                                {scroll.subtitle}
                              </div>
                              <h4 className="text-sm font-bold text-stone-100">{scroll.title}</h4>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">
                            {scroll.difficulty}
                          </span>
                        </div>

                        <p className="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                          {scroll.narrativeStory}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-stone-800/80">
                        {/* Rewards Preview */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400">Rewards:</span>
                          <span className="text-amber-300 font-bold">
                            +{scroll.rewards.xp} XP • +{scroll.rewards.gold} Gold
                            {scroll.rewards.chronoShards ? ` • +${scroll.rewards.chronoShards} Shards` : ""}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartQuest(scroll.id);
                          }}
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Scroll className="w-3.5 h-3.5" /> Unseal & Embark
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
