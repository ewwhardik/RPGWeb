"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Shield,
  Swords,
  Copy,
  Check,
  LogOut,
  Flame,
  Plus,
  Compass,
  AlertTriangle,
  Megaphone,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface PartyMemberData {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    level: number;
    title: string;
    avatar: string;
    characterClass: string;
    streakCount: number;
    prestigeLevel?: number;
  };
}

interface PartyData {
  id: string;
  name: string;
  code: string;
  bossName: string;
  bossMaxHp: number;
  bossCurrentHp: number;
  bossInfo: {
    name: string;
    maxHp: number;
    description: string;
    humorQuote: string;
  };
  members: PartyMemberData[];
}

interface PartyBossWidgetProps {
  currentUsername?: string;
  onBossDefeated?: () => void;
}

export default function PartyBossWidget({
  currentUsername,
  onBossDefeated,
}: PartyBossWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [inParty, setInParty] = useState(false);
  const [party, setParty] = useState<PartyData | null>(null);

  // Forms
  const [activeTab, setActiveTab] = useState<"JOIN" | "CREATE">("JOIN");
  const [guildNameInput, setGuildNameInput] = useState("");
  const [guildCodeInput, setGuildCodeInput] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [cheerCooldown, setCheerCooldown] = useState(false);

  const fetchParty = useCallback(async () => {
    try {
      const res = await fetch("/api/party");
      const data = await res.json();
      if (res.ok && data.inParty) {
        setInParty(true);
        setParty(data.party);
      } else {
        setInParty(false);
        setParty(null);
      }
    } catch {
      setInParty(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  async function handleCreateGuild(e: React.FormEvent) {
    e.preventDefault();
    if (!guildNameInput.trim()) return;

    soundFx.playClick();
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE", name: guildNameInput.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        soundFx.playLevelUp();
        setActionSuccess(data.message);
        setGuildNameInput("");
        fetchParty();
      } else {
        setActionError(data.error || "The guild registry denied the charter.");
      }
    } catch {
      setActionError("Failed to reach the guild scribe.");
    }
  }

  async function handleJoinGuild(e: React.FormEvent) {
    e.preventDefault();
    if (!guildCodeInput.trim()) return;

    soundFx.playClick();
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "JOIN", code: guildCodeInput.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        soundFx.playLevelUp();
        setActionSuccess(data.message);
        setGuildCodeInput("");
        fetchParty();
      } else {
        setActionError(data.error || "The guild seal could not be verified.");
      }
    } catch {
      setActionError("Failed to reach the guild scribe.");
    }
  }

  async function handleLeaveGuild() {
    if (!confirm("Are you sure you want to abandon your party members to the Procrastination Wyrm?")) {
      return;
    }

    soundFx.playClick();
    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LEAVE" }),
      });
      if (res.ok) {
        setInParty(false);
        setParty(null);
      }
    } catch {
      setActionError("Could not resign your guild commission.");
    }
  }

  async function handleCheer() {
    if (cheerCooldown) return;
    soundFx.playClick();
    setCheerCooldown(true);

    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CHEER" }),
      });
      const data = await res.json();
      if (res.ok) {
        soundFx.playStamp();
        setActionSuccess(data.message);
        if (data.bossResult?.bossDefeated && onBossDefeated) {
          onBossDefeated();
        }
        fetchParty();
      }
    } catch {
      // Ignored
    } finally {
      setTimeout(() => setCheerCooldown(false), 5000);
    }
  }

  function handleCopyCode() {
    if (!party) return;
    soundFx.playClick();
    navigator.clipboard.writeText(party.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  }

  if (loading) {
    return (
      <div className="rpg-panel carved-panel p-5 animate-pulse flex items-center justify-center min-h-[220px]">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Summoning Guild Warboard...</span>
      </div>
    );
  }

  // Not in a party: Show Guild Recruitment Station
  if (!inParty || !party) {
    return (
      <div className="rpg-panel carved-panel p-5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-600/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-title text-stone-900 dark:text-slate-100">
                Guild Recruitment Hall
              </h3>
              <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                Team up with allies to defeat shared Boss Raids.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-amber-900 dark:text-amber-400 font-bold font-mono bg-amber-100 dark:bg-background px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-slate-800 shadow-sm">
            Co-op Raid Active
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 my-4">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab("JOIN");
              setActionError("");
              setActionSuccess("");
            }}
            className={`flex-1 text-xs py-2 px-3 rounded-lg border font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "JOIN"
                ? "bg-amber-100 dark:bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-300 shadow-sm"
                : "bg-stone-100 dark:bg-card border-stone-300 dark:border-slate-800 text-stone-700 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Join with Code
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab("CREATE");
              setActionError("");
              setActionSuccess("");
            }}
            className={`flex-1 text-xs py-2 px-3 rounded-lg border font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "CREATE"
                ? "bg-amber-100 dark:bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-300 shadow-sm"
                : "bg-stone-100 dark:bg-card border-stone-300 dark:border-slate-800 text-stone-700 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Found New Guild
          </button>
        </div>

        {/* Form area */}
        {activeTab === "JOIN" ? (
          <form onSubmit={handleJoinGuild} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-slate-200 mb-1.5">
                Guild Enlistment Code
              </label>
              <input
                type="text"
                value={guildCodeInput}
                onChange={(e) => setGuildCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. FOCUS-4921"
                className="w-full bg-white dark:bg-slate-900 border-2 border-stone-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-stone-950 dark:text-white font-mono font-bold focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 tracking-wider uppercase shadow-inner placeholder:text-stone-400"
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={!guildCodeInput.trim()}
              className="w-full btn-gold text-xs py-2.5 flex items-center justify-center gap-2 font-bold shadow-md disabled:opacity-50"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Swear Guild Oath</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateGuild} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-slate-200 mb-1.5">
                Guild Fellowship Name
              </label>
              <input
                type="text"
                value={guildNameInput}
                onChange={(e) => setGuildNameInput(e.target.value)}
                placeholder="e.g. The Midnight Synthesizers"
                className="w-full bg-white dark:bg-slate-900 border-2 border-stone-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-stone-950 dark:text-white font-bold focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-inner placeholder:text-stone-400"
                maxLength={40}
              />
            </div>
            <button
              type="submit"
              disabled={!guildNameInput.trim()}
              className="w-full btn-gold text-xs py-2.5 flex items-center justify-center gap-2 font-bold shadow-md disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Charter Guild (Free)</span>
            </button>
          </form>
        )}

        {actionError && (
          <div className="mt-3.5 p-3 rounded-lg bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800/40 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mt-3.5 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-slate-800 text-xs text-stone-700 dark:text-slate-400 flex items-center justify-between font-medium">
          <span>Guild members share Boss damage on every quest</span>
          <span className="text-amber-900 dark:text-amber-300 font-black">100 Gold Boss Bounties</span>
        </div>
      </div>
    );
  }

  // In Party: Active Boss Raid Warboard
  const hpPercent = Math.max(0, Math.min(100, Math.round((party.bossCurrentHp / party.bossMaxHp) * 100)));
  const hpColor =
    hpPercent > 50 ? "bg-emerald-500" : hpPercent > 20 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rpg-panel carved-panel p-5 relative overflow-hidden space-y-4">
      {/* Header with Guild Name, Code & Leave */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-title text-amber-950 dark:text-amber-300">
              {party.name}
            </h3>
            <span className="text-[10px] bg-stone-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-slate-300 font-mono">
              {party.members.length} {party.members.length === 1 ? "Adventurer" : "Adventurers"}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-slate-400">
            Cooperative Boss Raid: All quest completions deal damage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Invite Code button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="text-xs py-1 px-2.5 rounded-lg bg-amber-50 dark:bg-card border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-300 hover:border-amber-500 flex items-center gap-1.5 transition-colors font-bold"
            title="Copy invite code to clipboard"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="font-mono text-[11px] tracking-wider">{party.code}</span>
              </>
            )}
          </button>

          {/* Leave Party button */}
          <button
            type="button"
            onClick={handleLeaveGuild}
            className="p-1.5 rounded-lg bg-card border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:border-red-800/60 transition-colors"
            title="Leave Guild"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Boss Raid Arena Card */}
      <div className="p-4 rounded-xl bg-stone-900 text-stone-100 dark:bg-[#0e141d] dark:text-slate-100 border border-red-900/60 dark:border-red-950/60 shadow-inner relative overflow-hidden">
        {/* Subtle red background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h4 className="text-sm font-bold font-title text-red-300 flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-red-400" />
              {party.bossName}
            </h4>
          </div>
          <div className="text-[11px] font-mono font-bold text-stone-300 dark:text-slate-300">
            {party.bossCurrentHp.toLocaleString()} / {party.bossMaxHp.toLocaleString()} HP ({hpPercent}%)
          </div>
        </div>

        <p className="text-xs text-stone-300 dark:text-slate-300 italic mb-2">
          &ldquo;{party.bossInfo?.humorQuote}&rdquo;
        </p>

        {/* Boss HP Bar */}
        <div className="w-full bg-stone-950 dark:bg-background h-4 rounded-full overflow-hidden p-0.5 border border-stone-700 dark:border-slate-800 mb-3 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${hpColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Action Controls: Rally Cheer & Weakness info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-stone-800 dark:border-slate-800">
          <span className="text-[10px] text-stone-400 dark:text-slate-400">
            ⚔️ Weakness: Finish your daily quests to inflict direct raid strikes.
          </span>

          <button
            type="button"
            onClick={handleCheer}
            disabled={cheerCooldown}
            className="btn-dark text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-300 border-amber-500/40 hover:bg-amber-500/10 disabled:opacity-50 font-bold"
            title="Shout battle cry to deal 25 morale raid damage"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>{cheerCooldown ? "Morale Echoing..." : "Rally Guild (+25 Dmg)"}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Guild Roster */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Active Guild Roster
          </span>
          <span className="text-[11px] text-stone-600 dark:text-slate-400 font-mono">
            Shared Bounties: +100 Gold each upon boss defeat
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {party.members.map((member) => {
            const isMe = member.user.username === currentUsername;
            return (
              <div
                key={member.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                  isMe
                    ? "bg-amber-100/80 dark:bg-amber-500/10 border-amber-400 dark:border-amber-500/40 text-stone-900 dark:text-slate-100 shadow-sm"
                    : "bg-stone-50 dark:bg-[#101721] border-stone-200 dark:border-slate-800 text-stone-800 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-[#16202c] border border-stone-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-amber-800 dark:text-amber-400 uppercase">
                    {member.user.username.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{member.user.username}</span>
                      {isMe && (
                        <span className="text-[9px] bg-amber-200 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 px-1 rounded border border-amber-400 dark:border-amber-500/30 font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-600 dark:text-slate-400">
                      Lvl {member.user.level} {(member.user.prestigeLevel ?? 0) > 0 && `★${member.user.prestigeLevel}`} {member.user.characterClass || "Warrior"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-mono text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  <span>{member.user.streakCount || 1}d</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
