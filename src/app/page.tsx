"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Plus,
  Search,
  Volume2,
  VolumeX,
  ShoppingBag,
  Dices,
  LogOut,
  Sparkles,
  Filter,
  Zap,
  Dumbbell,
  BookOpen,
  Heart,
  MessageSquare,
  Smile,
} from "lucide-react";
import { calculateLevelFromTotalXp } from "@/lib/rpgEngine";
import { soundFx } from "@/lib/audio";
import HeroDiorama3D from "@/components/HeroDiorama3D";
import StatRadarMeter from "@/components/StatRadarMeter";
import QuestCard, { QuestItem } from "@/components/QuestCard";
import NewQuestModal from "@/components/NewQuestModal";
import LevelUpModal from "@/components/LevelUpModal";
import ShopModal from "@/components/ShopModal";
import WheelOfFateModal from "@/components/WheelOfFateModal";
import DeskGoblin from "@/components/DeskGoblin";
import MimicChest from "@/components/MimicChest";
import ActivityChronicle from "@/components/ActivityChronicle";
import AuthModal from "@/components/AuthModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClassSelectModal from "@/components/ClassSelectModal";
import PartyBossWidget from "@/components/PartyBossWidget";
import { CharacterClassType } from "@/lib/classes";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  gold: number;
  streakCount: number;
  title: string;
  avatar: string;
  characterClass?: string;
  stats?: {
    strength: number;
    intellect: number;
    vitality: number;
    dexterity: number;
    charisma: number;
    sanity: number;
  };
}

interface ActivityLogItem {
  id: string;
  actionType: string;
  message: string;
  xpChange: number;
  goldChange: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Popups
  const [isNewQuestModalOpen, setIsNewQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<QuestItem | null>(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isFateModalOpen, setIsFateModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [decayAlerts, setDecayAlerts] = useState<string[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
  const [raidToast, setRaidToast] = useState<{ message: string; isVictory: boolean } | null>(null);

  // Audio mute state
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundFx.getMuted());
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        if (data.decayAlerts && Array.isArray(data.decayAlerts)) {
          setDecayAlerts(data.decayAlerts);
        }
        setIsAuthModalOpen(false);
      } else {
        setIsAuthModalOpen(true);
      }
    } catch {
      setIsAuthModalOpen(true);
    } finally {
      setAuthChecked(true);
    }
  }

  const fetchQuests = useCallback(async () => {
    setLoadingQuests(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/quests?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setQuests(data.tasks || []);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoadingQuests(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      fetchQuests();
      fetchLogs();
    }
  }, [user, fetchQuests, fetchLogs]);

  function handleToggleSound() {
    const nextMuted = soundFx.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundFx.playClick();
    }
  }

  async function handleLogout() {
    soundFx.playClick();
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsAuthModalOpen(true);
  }

  async function handleQuestComplete(id: string) {
    try {
      const res = await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPLETE" }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                level: data.user.level,
                xp: data.user.xp,
                gold: data.user.gold,
                title: data.user.title,
                stats: data.user.stats,
              }
            : null
        );

        fetchQuests();
        fetchLogs();

        if (data.didLevelUp) {
          setLevelUpData({
            level: data.newLevel,
            title: data.newTitle,
          });
        }

        if (data.partyRaid) {
          if (data.partyRaid.bossDefeated) {
            setRaidToast({
              message: `Boss Vanquished! ${data.partyRaid.bossName} fell! Guild earned +100 Gold & +150 XP!`,
              isVictory: true,
            });
            soundFx.playLevelUp();
          } else {
            setRaidToast({
              message: `Raid Strike: Slashed ${data.partyRaid.damageDealt} HP off ${data.partyRaid.bossName}!`,
              isVictory: false,
            });
          }
          setTimeout(() => setRaidToast(null), 4500);
        }
      }
    } catch (err) {
      console.error("Quest completion error:", err);
    }
  }

  async function handleQuestDelete(id: string) {
    if (!confirm("Feed this quest scroll to the shredder goblin?")) return;
    soundFx.playClick();
    try {
      const res = await fetch(`/api/quests/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchQuests();
        fetchLogs();
      }
    } catch {}
  }

  async function handleQuestSave(questData: {
    id?: string;
    title: string;
    description?: string | null;
    category: string;
    difficulty: string;
    dueDate?: string | null;
  }) {
    if (questData.id) {
      await fetch(`/api/quests/${questData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EDIT",
          ...questData,
        }),
      });
    } else {
      await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questData),
      });
    }
    setEditingQuest(null);
    fetchQuests();
    fetchLogs();
  }

  function handleBonusGold(amount: number) {
    setUser((prev) => (prev ? { ...prev, gold: prev.gold + amount } : null));
    fetchLogs();
  }

  const levelInfo = calculateLevelFromTotalXp(user?.xp || 0);

  const categories: Array<{
    key: string;
    label: string;
    color: string;
    icon: React.ElementType;
  }> = [
    { key: "ALL", label: "All Attributes", color: "#f59e0b", icon: Sparkles },
    { key: "STRENGTH", label: "Strength", color: "#ef4444", icon: Dumbbell },
    { key: "INTELLECT", label: "Intellect", color: "#38bdf8", icon: BookOpen },
    { key: "VITALITY", label: "Vitality", color: "#10b981", icon: Heart },
    { key: "DEXTERITY", label: "Dexterity", color: "#f59e0b", icon: Zap },
    { key: "CHARISMA", label: "Charisma", color: "#fbbf24", icon: MessageSquare },
    { key: "SANITY", label: "Sanity", color: "#34d399", icon: Smile },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100">
        {/* Top Apple-UI Styled Glass Bubble Navigation Bar */}
        <header className="sticky top-0 z-30 px-4 lg:px-8 py-3 bg-[#0b0e14]/85 backdrop-blur-xl border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black font-title tracking-wide text-amber-300">
                    QuestSmith
                  </h1>
                  <span className="wax-stamp text-[9px] py-0.2 px-1.5 border-amber-500 text-amber-400">
                    LIFE RPG
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">The Adventurer&apos;s Bureaucracy</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Audio Mute Switch */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="p-2 rounded-lg bg-[#141b24] border border-slate-800 text-slate-300 hover:text-amber-300 transition-colors shadow"
                title={isMuted ? "Unmute Audio SFX" : "Mute Audio SFX"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Wheel of Fate */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsFateModalOpen(true);
                }}
                className="btn-dark text-xs py-2 px-3.5 flex items-center gap-1.5 text-amber-300"
                title="Spin the Wheel of Unreasonable Fate"
              >
                <Dices className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Wheel of Fate</span>
              </button>

              {/* Shop Bazaar */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsShopModalOpen(true);
                }}
                className="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5"
                title="Visit Merchant Bazaar"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Merchant Bazaar</span>
              </button>

              {/* Class Archetype */}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsClassModalOpen(true);
                  }}
                  className="btn-dark text-xs py-2 px-3 flex items-center gap-1.5 text-amber-300 border-amber-500/30"
                  title="Change Class Archetype"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{user.characterClass || "WARRIOR"}</span>
                </button>
              )}

              {/* User Profile & Logout */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-slate-200">{user.username}</div>
                    <div className="text-[10px] text-amber-400 font-mono">Lvl {levelInfo.level}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-red-950/30 border border-red-800/40 text-red-400 hover:bg-red-950/60 transition-colors"
                    title="Sign out of Guild"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-gold text-xs py-2 px-3.5"
                >
                  Enter Guild
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Dashboard */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
          {/* Hero Section: Diorama in a Box & Attribute Radar */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 3D Diorama in a Box */}
            <div className="lg:col-span-5 diorama-box p-4 flex flex-col justify-between overflow-hidden border border-slate-800/60 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold font-title text-amber-300">
                    Live 3D Hero Relic
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Voxel Engine Active</span>
              </div>

              <HeroDiorama3D
                level={levelInfo.level}
                xpProgress={levelInfo.progressPercent}
                gold={user?.gold || 0}
              />

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Artifact Resonance: {levelInfo.level * 10}%</span>
                <span className="text-amber-400 font-bold">{user?.title || "Novice"}</span>
              </div>
            </div>

            {/* Stat Radar & XP Progression Meter */}
            <div className="lg:col-span-7">
              <StatRadarMeter
                stats={
                  user?.stats || {
                    strength: 10,
                    intellect: 10,
                    vitality: 10,
                    dexterity: 10,
                    charisma: 10,
                    sanity: 10,
                  }
                }
                levelInfo={levelInfo}
                gold={user?.gold || 0}
                streakCount={user?.streakCount || 1}
                characterClass={user?.characterClass || "WARRIOR"}
                onOpenClassModal={() => setIsClassModalOpen(true)}
                decayAlerts={decayAlerts}
              />
            </div>
          </section>

          {/* Guild Warboard & Cooperative Boss Raid */}
          {user && (
            <section>
              <PartyBossWidget
                currentUsername={user.username}
                onBossDefeated={() => {
                  fetchCurrentUser();
                  fetchLogs();
                }}
              />
            </section>
          )}

          {/* Quest Board & Sidebar */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Quest Management Center */}
            <div className="lg:col-span-8 space-y-4">
              {/* Filter and Action Bar */}
              <div className="rpg-panel carved-panel p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold font-title text-slate-100 flex items-center gap-2">
                      <span>Active Quest Dispatch</span>
                      <span className="text-xs bg-[#0b0e14] px-2 py-0.5 rounded text-amber-400 border border-slate-800 font-mono">
                        {quests.length} Total
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Vanquish real-world friction to earn gold, stamina, and attribute points.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setEditingQuest(null);
                      setIsNewQuestModalOpen(true);
                    }}
                    className="btn-gold text-xs py-2 px-4 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Quest</span>
                  </button>
                </div>

                {/* Status Tabs and Search */}
                <div className="pt-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-lg border border-slate-800 overflow-x-auto">
                    {[
                      { key: "ALL", label: "All Quests" },
                      { key: "TODO", label: "In Progress" },
                      { key: "COMPLETED", label: "Slain" },
                      { key: "ABANDONED", label: "Archived" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setStatusFilter(tab.key);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
                          statusFilter === tab.key
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search quest scrolls..."
                      className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Consistently Color-Coded Category Filter Chips */}
                <div className="flex items-center gap-1.5 pt-3.5 overflow-x-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
                  {categories.map((cat) => {
                    const isSelected = categoryFilter === cat.key;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setCategoryFilter(cat.key);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full border transition-all whitespace-nowrap font-medium"
                        style={{
                          borderColor: isSelected ? cat.color : "#273549",
                          backgroundColor: isSelected ? `${cat.color}25` : "#0b0e14",
                          color: isSelected ? cat.color : "#94a3b8",
                          fontWeight: isSelected ? 700 : 500,
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quests Display */}
              {loadingQuests ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-pulse">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="rpg-panel border border-slate-800 bg-[#121822] p-4 h-36 flex flex-col justify-between"
                    >
                      <div className="flex gap-2">
                        <div className="w-16 h-4 bg-slate-800 rounded" />
                        <div className="w-12 h-4 bg-slate-800 rounded" />
                      </div>
                      <div className="w-3/4 h-5 bg-slate-800 rounded" />
                      <div className="w-1/2 h-3 bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              ) : quests.length === 0 ? (
                /* Custom Illustrated Sleeping Desk Goblin Empty State */
                <div className="rpg-panel border border-dashed border-slate-800 bg-[#121822] p-10 text-center carved-panel">
                  <div className="relative inline-block mb-3">
                    <span className="text-5xl select-none">👺</span>
                    <span className="absolute -top-1 -right-4 text-xs font-mono font-bold text-amber-400 animate-bounce">
                      Zzz...
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-title text-amber-300 mb-1">
                    Bartholomew is Asleep on the Notice Board
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
                    There are no quests posted under these filters. Either you have conquered
                    every duty in the realm, or you are cleverly hiding from mortal productivity.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsNewQuestModalOpen(true);
                    }}
                    className="btn-gold text-xs py-2 px-5"
                  >
                    Post First Quest
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {quests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={handleQuestComplete}
                      onEdit={(q) => {
                        soundFx.playClick();
                        setEditingQuest(q);
                        setIsNewQuestModalOpen(true);
                      }}
                      onDelete={handleQuestDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Quirks, Desk Goblin, Mimic & Chronicle */}
            <div className="lg:col-span-4 space-y-4">
              <MimicChest onBonusGold={handleBonusGold} />
              <ActivityChronicle logs={logs} />
            </div>
          </section>
        </main>

        {/* Floating Desk Goblin Mascot */}
        {user && (
          <DeskGoblin
            gold={user.gold}
            onFeedSuccess={(newGold, sanityGain) => {
              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      gold: newGold,
                      stats: {
                        strength: prev.stats?.strength || 10,
                        intellect: prev.stats?.intellect || 10,
                        vitality: prev.stats?.vitality || 10,
                        dexterity: prev.stats?.dexterity || 10,
                        charisma: prev.stats?.charisma || 10,
                        sanity: (prev.stats?.sanity || 10) + sanityGain,
                      },
                    }
                  : null
              );
              fetchLogs();
            }}
          />
        )}

        {/* Modals */}
        <AuthModal
          isOpen={isAuthModalOpen && authChecked}
          onSuccess={(userData) => {
            setUser(userData);
            setIsAuthModalOpen(false);
            soundFx.playLevelUp();
          }}
        />

        <NewQuestModal
          isOpen={isNewQuestModalOpen}
          onClose={() => {
            setIsNewQuestModalOpen(false);
            setEditingQuest(null);
          }}
          onSave={handleQuestSave}
          initialData={editingQuest}
        />

        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          newLevel={levelUpData?.level || 1}
          newTitle={levelUpData?.title || "Adventurer"}
        />

        <ShopModal
          isOpen={isShopModalOpen}
          onClose={() => setIsShopModalOpen(false)}
          userGold={user?.gold || 0}
          onGoldChange={(newGold) => {
            setUser((prev) => (prev ? { ...prev, gold: newGold } : null));
            fetchLogs();
          }}
          onInventoryChange={() => {
            fetchCurrentUser();
            fetchLogs();
          }}
        />

        <WheelOfFateModal
          isOpen={isFateModalOpen}
          onClose={() => setIsFateModalOpen(false)}
          userGold={user?.gold || 0}
          onSpinSuccess={(data) => {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    gold: data.newGold,
                    title: data.newTitle,
                    stats: {
                      strength: prev.stats?.strength || 10,
                      intellect: prev.stats?.intellect || 10,
                      vitality: prev.stats?.vitality || 10,
                      dexterity: prev.stats?.dexterity || 10,
                      charisma: prev.stats?.charisma || 10,
                      sanity: (prev.stats?.sanity || 10) + (data.sanityBoost || 0),
                    },
                  }
                : null
            );
            fetchLogs();
          }}
        />

        <ClassSelectModal
          isOpen={isClassModalOpen}
          currentClass={(user?.characterClass as CharacterClassType) || "WARRIOR"}
          onClose={() => setIsClassModalOpen(false)}
          onClassSelected={(newClass) => {
            setUser((prev) => (prev ? { ...prev, characterClass: newClass } : null));
            fetchCurrentUser();
            fetchLogs();
          }}
        />

        {/* Floating Boss Raid Alert Toast */}
        {raidToast && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 transition-all ${
              raidToast.isVictory
                ? "bg-amber-950/95 border-amber-500 text-amber-200 shadow-amber-900/30"
                : "bg-red-950/95 border-red-500 text-red-200 shadow-red-900/30"
            }`}
          >
            <span className="text-xl">{raidToast.isVictory ? "🏆" : "⚔️"}</span>
            <div className="text-xs font-bold font-title">{raidToast.message}</div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
