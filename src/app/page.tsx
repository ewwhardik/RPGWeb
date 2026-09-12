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
  CheckCircle2,
  Clock,
  Archive,
  RefreshCw,
} from "lucide-react";
import { calculateLevelFromTotalXp, QuestCategory } from "@/lib/rpgEngine";
import { soundFx } from "@/lib/audio";
import HeroDiorama3D from "@/components/HeroDiorama3D";
import StatRadarMeter from "@/components/StatRadarMeter";
import QuestCard from "@/components/QuestCard";
import NewQuestModal from "@/components/NewQuestModal";
import LevelUpModal from "@/components/LevelUpModal";
import ShopModal from "@/components/ShopModal";
import WheelOfFateModal from "@/components/WheelOfFateModal";
import DeskGoblin from "@/components/DeskGoblin";
import MimicChest from "@/components/MimicChest";
import ActivityChronicle from "@/components/ActivityChronicle";
import AuthModal from "@/components/AuthModal";

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [quests, setQuests] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Popups
  const [isNewQuestModalOpen, setIsNewQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<any | null>(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isFateModalOpen, setIsFateModalOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);

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
      // Handled silently
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
        // Update user state
        setUser((prev: any) => ({
          ...prev,
          level: data.user.level,
          xp: data.user.xp,
          gold: data.user.gold,
          title: data.user.title,
          stats: data.user.stats,
        }));

        // Refresh quests & logs
        fetchQuests();
        fetchLogs();

        // Level Up Trigger!
        if (data.didLevelUp) {
          setLevelUpData({
            level: data.newLevel,
            title: data.newTitle,
          });
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

  async function handleQuestSave(questData: any) {
    if (questData.id) {
      // Edit existing
      await fetch(`/api/quests/${questData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EDIT",
          ...questData,
        }),
      });
    } else {
      // Create new
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
    setUser((prev: any) => (prev ? { ...prev, gold: prev.gold + amount } : prev));
    fetchLogs();
  }

  // Calculate current progress
  const levelInfo = calculateLevelFromTotalXp(user?.xp || 0);

  const categories: { key: string; label: string }[] = [
    { key: "ALL", label: "All Attributes" },
    { key: "STRENGTH", label: "Strength" },
    { key: "INTELLECT", label: "Intellect" },
    { key: "VITALITY", label: "Vitality" },
    { key: "DEXTERITY", label: "Dexterity" },
    { key: "CHARISMA", label: "Charisma" },
    { key: "SANITY", label: "Sanity" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100">
      {/* Top Guild Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0e131b]/95 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wide text-amber-300">
                  QuestSmith
                </h1>
                <span className="wax-stamp text-[9px] py-0.2 px-1.5 border-amber-500 text-amber-400">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400">The Adventurer's Bureaucracy</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 rounded-lg bg-[#141b24] border border-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
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
              className="btn-dark text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-300"
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
              className="btn-gold text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="Visit Merchant Bazaar"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Merchant Bazaar</span>
            </button>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-200">{user.username}</div>
                  <div className="text-[10px] text-amber-400">Lvl {levelInfo.level}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-950/30 border border-red-800/40 text-red-400 hover:bg-red-950/60"
                  title="Sign out of Guild"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-gold text-xs py-1.5 px-3"
              >
                Enter Guild
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Hero Section: 3D Interactive Diorama & Tactical Stat Radar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 3D Canvas Diorama */}
          <div className="lg:col-span-5 rpg-panel border border-[#b45309]/50 bg-[#121822] p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-amber-300">Live 3D Hero Relic</span>
              </div>
              <span className="text-[10px] text-slate-400">Interactive Voxel Engine</span>
            </div>

            <HeroDiorama3D
              level={levelInfo.level}
              xpProgress={levelInfo.progressPercent}
              gold={user?.gold || 0}
            />

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Artifact Resonance: {levelInfo.level * 10}%</span>
              <span className="text-amber-400 font-semibold">{user?.title || "Novice"}</span>
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
            />
          </div>
        </section>

        {/* Dashboard Body: Quest Board (Left) & Side Quirks (Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Quest Management Center */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quest Board Controls Header */}
            <div className="rpg-panel border border-slate-800 bg-[#121822] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Active Quest Dispatch</span>
                    <span className="text-xs bg-[#0b0e14] px-2 py-0.5 rounded text-amber-400 border border-slate-800">
                      {quests.length} Total
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Slay mundane chores to harvest dopamine and level up your character.
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
              <div className="pt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Status Tabs */}
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
                      className={`px-3 py-1 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
                        statusFilter === tab.key
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search quest scrolls..."
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 pt-3 overflow-x-auto">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setCategoryFilter(cat.key);
                    }}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all whitespace-nowrap ${
                      categoryFilter === cat.key
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-[#0b0e14] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quests List */}
            {loadingQuests ? (
              <div className="text-center py-16 text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Unrolling quest parchment...</span>
              </div>
            ) : quests.length === 0 ? (
              <div className="rpg-panel border border-dashed border-slate-800 bg-[#121822] p-10 text-center">
                <div className="text-4xl mb-3">📜</div>
                <h3 className="text-sm font-bold text-slate-300 mb-1">
                  The Notice Board is Empty!
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Either you have vanquished all mortal responsibilities, or you are cleverly
                  avoiding writing them down.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsNewQuestModalOpen(true);
                  }}
                  className="btn-gold text-xs py-1.5 px-4"
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

          {/* Right: Quirks, Desk Goblin, Suspicious Mimic & Chronicle */}
          <div className="lg:col-span-4 space-y-4">
            {/* Suspicious Mimic Chest */}
            <MimicChest onBonusGold={handleBonusGold} />

            {/* Guild Chronicle Log */}
            <ActivityChronicle logs={logs} />
          </div>
        </section>
      </main>

      {/* Floating Bartholomew Desk Goblin */}
      {user && (
        <DeskGoblin
          gold={user.gold}
          onFeedSuccess={(newGold, sanityGain) => {
            setUser((prev: any) => ({
              ...prev,
              gold: newGold,
              stats: {
                ...prev.stats,
                sanity: (prev.stats?.sanity || 10) + sanityGain,
              },
            }));
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
          setUser((prev: any) => ({ ...prev, gold: newGold }));
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
          setUser((prev: any) => ({
            ...prev,
            gold: data.newGold,
            title: data.newTitle,
            stats: {
              ...prev.stats,
              sanity: (prev.stats?.sanity || 10) + (data.sanityBoost || 0),
            },
          }));
          fetchLogs();
        }}
      />
    </div>
  );
}
