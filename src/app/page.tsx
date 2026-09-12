"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
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
  Keyboard,
  PawPrint,
} from "lucide-react";
import { calculateLevelFromTotalXp } from "@/lib/rpgEngine";
import { soundFx } from "@/lib/audio";
import HeroDiorama3D from "@/components/HeroDiorama3D";
import GhostAccent from "@/components/GhostAccent";
import StatRadarMeter from "@/components/StatRadarMeter";
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
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import HeroVitalsHeader from "@/components/HeroVitalsHeader";
import ClassSkillsBar from "@/components/ClassSkillsBar";
import TaskBoardGrid, { TaskItem } from "@/components/TaskBoardGrid";
import TaskEditorModal from "@/components/TaskEditorModal";
import StableModal from "@/components/StableModal";
import LootDropModal from "@/components/LootDropModal";
import CustomCursor from "@/components/CustomCursor";
import FloatingCombatText, { spawnCombatText } from "@/components/FloatingCombatText";
import RelicVaultModal from "@/components/RelicVaultModal";
import ChronoCodexModal from "@/components/ChronoCodexModal";
import CosmicDarshanModal from "@/components/CosmicDarshanModal";
import QuestScrollsModal from "@/components/QuestScrollsModal";
import GuildChallengesModal from "@/components/GuildChallengesModal";
import SamsaraHeatmap from "@/components/SamsaraHeatmap";
import { setupAutoSync } from "@/lib/offlineSync";
import { getTodayKingdomWeather, KingdomWeather } from "@/lib/weatherEngine";
import { MysteryDropItem } from "@/lib/taskEngine";
import { CharacterClassType } from "@/lib/classes";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  isSleeping: boolean;
  streakCount: number;
  title: string;
  avatar: string;
  characterClass?: string;
  prestigeLevel?: number;
  currentPet?: string | null;
  currentMount?: string | null;
  vaultPulls?: number;
  chronoShards?: number;
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

  // 4-Column Productivity Task Board
  const [habits, setHabits] = useState<TaskItem[]>([]);
  const [dailies, setDailies] = useState<TaskItem[]>([]);
  const [todos, setTodos] = useState<TaskItem[]>([]);
  const [rewards, setRewards] = useState<TaskItem[]>([]);

  const [logs, setLogs] = useState<ActivityLogItem[]>([]);

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Popups
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [newTaskDefaultType, setNewTaskDefaultType] = useState<"HABIT" | "DAILY" | "TODO" | "REWARD">("HABIT");
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isFateModalOpen, setIsFateModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isCodexModalOpen, setIsCodexModalOpen] = useState(false);
  const [isDarshanModalOpen, setIsDarshanModalOpen] = useState(false);
  const [isQuestScrollsModalOpen, setIsQuestScrollsModalOpen] = useState(false);
  const [isChallengesModalOpen, setIsChallengesModalOpen] = useState(false);
  const [todayWeather] = useState<KingdomWeather>(getTodayKingdomWeather());
  const [ambience, setAmbience] = useState<"hearth" | "dungeon" | "tanpura" | null>(null);
  const [decayAlerts, setDecayAlerts] = useState<string[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
  const [raidToast, setRaidToast] = useState<{ message: string; isVictory: boolean } | null>(null);
  const [faintAlert, setFaintAlert] = useState<string | null>(null);
  const [currentLootDrop, setCurrentLootDrop] = useState<MysteryDropItem | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
        setUser({
          ...data.user,
          hp: data.user.hp ?? 50,
          maxHp: data.user.maxHp ?? 50,
          mp: data.user.mp ?? 50,
          maxMp: data.user.maxMp ?? 50,
          isSleeping: data.user.isSleeping ?? false,
          currentPet: data.user.currentPet ?? null,
          currentMount: data.user.currentMount ?? null,
          vaultPulls: data.user.vaultPulls ?? 0,
          chronoShards: data.user.chronoShards ?? 0,
        });
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

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "ALL") params.append("tag", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setHabits(data.habits || []);
        setDailies(data.dailies || []);
        setTodos(data.todos || []);
        setRewards(data.rewards || []);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  }, [categoryFilter, searchQuery]);

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
      fetchTasks();
      fetchLogs();
    }

    const cleanupSync = setupAutoSync((res) => {
      if (res.synced > 0) {
        spawnCombatText(`🔄 Synced ${res.synced} offline quest actions!`, "xp");
        fetchCurrentUser();
        fetchLogs();
      }
    });

    return () => cleanupSync();
  }, [user, fetchTasks, fetchLogs]);

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

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setEditingTask(null);
        setNewTaskDefaultType("HABIT");
        setIsNewTaskModalOpen(true);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        handleToggleSound();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setIsShopModalOpen((prev) => !prev);
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        setIsFateModalOpen((prev) => !prev);
      } else if (e.key === "?") {
        e.preventDefault();
        setIsHelpModalOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsNewTaskModalOpen(false);
        setIsPetModalOpen(false);
        setIsShopModalOpen(false);
        setIsFateModalOpen(false);
        setIsHelpModalOpen(false);
        setIsClassModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Inn Rest Toggle
  const handleToggleInn = async () => {
    try {
      const res = await fetch("/api/inn", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser((prev) => (prev ? { ...prev, isSleeping: data.isSleeping } : null));
        fetchLogs();
      }
    } catch (err) {
      console.error("Inn toggle error:", err);
    }
  };

  const scoringTasksRef = useRef<Set<string>>(new Set());

  // Score Task (+/- habit, daily check/uncheck, todo complete, reward buy)
  const handleScoreTask = async (taskId: string, direction: "up" | "down") => {
    const scoreKey = `${taskId}_${direction}`;
    if (scoringTasksRef.current.has(scoreKey)) {
      return; // Ignore duplicate click
    }
    scoringTasksRef.current.add(scoreKey);
    setTimeout(() => {
      scoringTasksRef.current.delete(scoreKey);
    }, 350);

    try {
      const res = await fetch(`/api/tasks/${taskId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  hp: data.user.hp,
                  maxHp: data.user.maxHp,
                  mp: data.user.mp,
                  maxMp: data.user.maxMp,
                  xp: data.user.xp,
                  gold: data.user.gold,
                  level: data.user.level,
                  chronoShards: data.user.chronoShards ?? prev.chronoShards ?? 0,
                }
              : null
          );
        }

        // Spawn Floating Combat Text with Vedic Masala Crits
        if (data.shardGain) {
          spawnCombatText(`+${data.shardGain} Shards`, "shard");
        }
        if (data.raidResult?.damageDealt) {
          if (data.raidResult.damageDealt >= 50) {
            spawnCombatText(`🔱 SUDARSHANA CRIT! -${data.raidResult.damageDealt} DMG!`, "vedic");
            soundFx.playTempleBell();
          } else {
            spawnCombatText(`-${data.raidResult.damageDealt} Raid DMG!`, "crit");
          }
        }
        if (data.raidResult?.bossDefeated) {
          spawnCombatText("👑 DHARMA TRIUMPHS! BOSS SLAIN!", "vedic");
          soundFx.playTempleBell();
        }
        if (data.rageResult?.rageStrike) {
          spawnCombatText(`⚠️ RAGE STRIKE: -${data.rageResult.strikeDamage} HP!`, "damage");
        }

        // Playful Vedic Masala floater on high focus
        if (direction === "up" && Math.random() < 0.28) {
          const vedicPhrases = [
            "🔱 DHARMA UPHELD!",
            "☕ CHAI BOOST!",
            "🧘 SHANTI RESTORED",
            "🔥 TAPASYA REIGNITED!",
            "⚡ BRAHMASTRA FOCUS!",
          ];
          const phrase = vedicPhrases[Math.floor(Math.random() * vedicPhrases.length)];
          spawnCombatText(phrase, "vedic");
        }

        if (data.fainted) {
          setFaintAlert(data.message);
          soundFx.playFaint();
          setTimeout(() => setFaintAlert(null), 6000);
        }

        if (data.dropItem) {
          setCurrentLootDrop(data.dropItem);
        }

        if (data.didLevelUp) {
          setLevelUpData({
            level: data.user.level,
            title: user?.title || "Heroic Master",
          });
          soundFx.playLevelUp();
        }

        fetchTasks();
        fetchLogs();
      } else {
        if (data.error) {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error("Task score offline fallback:", err);
      try {
        const { queueOfflineAction } = await import("@/lib/offlineSync");
        await queueOfflineAction({
          endpoint: `/api/tasks/${taskId}/score`,
          method: "POST",
          payload: { direction },
          description: `Score task ${taskId} (${direction})`,
        });
        spawnCombatText("📦 Saved Offline (Auto-syncs online)", "mana");
        soundFx.play("stamp");
      } catch {}
    }
  };

  const handleToggleAmbience = () => {
    soundFx.playClick();
    if (!ambience) {
      soundFx.startTavernHearth();
      setAmbience("hearth");
      spawnCombatText("Tavern Hearth Ambience Kindled", "xp");
    } else if (ambience === "hearth") {
      soundFx.startDungeonAmbience();
      setAmbience("dungeon");
      spawnCombatText("Dungeon Echo Ambience Channeled", "mana");
    } else if (ambience === "dungeon") {
      soundFx.startTanpuraDrone();
      setAmbience("tanpura");
      spawnCombatText("Meditative Tanpura Drone Chanted (136.1 Hz Om)", "gold");
    } else {
      soundFx.stopAmbience();
      setAmbience(null);
      spawnCombatText("Ambience Quieted", "xp");
    }
  };

  // Buy Standard Shop Reward (Health Potion, Mana Potion, Enchanted Armoire)
  const handleBuyStandardReward = async (rewardId: string, cost: number) => {
    if (!user || user.gold < cost) return;

    try {
      if (rewardId === "health_potion") {
        const newHp = Math.min(user.maxHp || 50, user.hp + 15);
        const newGold = user.gold - cost;
        setUser((prev) => (prev ? { ...prev, hp: newHp, gold: newGold } : null));
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "REWARD",
            title: "Health Potion Consumed",
            description: "+15 Health restored.",
            cost,
          }),
        });
        soundFx.play("streak");
      } else if (rewardId === "mana_potion") {
        const newMp = Math.min(user.maxMp || 50, user.mp + 25);
        const newGold = user.gold - cost;
        setUser((prev) => (prev ? { ...prev, mp: newMp, gold: newGold } : null));
        soundFx.play("streak");
      } else if (rewardId === "enchanted_armoire") {
        const newGold = user.gold - cost;
        const bonusXp = 35;
        setUser((prev) => (prev ? { ...prev, xp: prev.xp + bonusXp, gold: newGold } : null));
        setRaidToast({
          message: "Enchanted Armoire opened! Unlocked mystery gear and +35 XP!",
          isVictory: true,
        });
        setTimeout(() => setRaidToast(null), 4000);
        soundFx.playLevelUp();
      } else if (rewardId === "kadak_chai") {
        const newMp = Math.min(user.maxMp || 50, user.mp + 30);
        const newGold = user.gold - cost;
        setUser((prev) => (prev ? { ...prev, mp: newMp, gold: newGold } : null));
        spawnCombatText("☕ KADAK CHAI SURGE! (+30 MP)", "mana");
        soundFx.play("streak");
      } else if (rewardId === "amrit_rasayana") {
        const newHp = Math.min(user.maxHp || 50, user.hp + 30);
        const bonusXp = 20;
        const newGold = user.gold - cost;
        setUser((prev) => (prev ? { ...prev, hp: newHp, xp: prev.xp + bonusXp, gold: newGold } : null));
        spawnCombatText("✨ AMRIT RASAYANA! (+30 HP, +20 XP)", "vedic");
        soundFx.playTempleBell();
      }
      fetchCurrentUser();
      fetchLogs();
    } catch (err) {
      console.error("Standard reward error:", err);
    }
  };

  // Quick Add task in column
  const handleQuickAddTask = async (
    type: "HABIT" | "DAILY" | "TODO" | "REWARD",
    title: string
  ) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title }),
      });
      if (res.ok) {
        fetchTasks();
        fetchLogs();
      }
    } catch (err) {
      console.error("Quick add task error:", err);
    }
  };

  // Full Task Save (Create or Edit)
  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    if (taskData.id) {
      await fetch(`/api/tasks/${taskData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
    }
    setEditingTask(null);
    fetchTasks();
    fetchLogs();
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Discard this task from the kingdom records?")) return;
    soundFx.playClick();
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks();
        fetchLogs();
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  // Update Subtask checklist
  const handleUpdateChecklist = async (taskId: string, newChecklistJson: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: newChecklistJson }),
      });
      fetchTasks();
    } catch (err) {
      console.error("Checklist update error:", err);
    }
  };

  const handleBonusGold = (amount: number) => {
    setUser((prev) => (prev ? { ...prev, gold: prev.gold + amount } : null));
    fetchLogs();
  };

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
      <div className="min-h-screen flex flex-col bg-[#111418] text-stone-100">
        {/* Top Tavern Navigation Bar: Apple Glass Floating Bubble Dock */}
        <header className="site-header sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 py-2.5 bg-[#0e1217]/50 backdrop-blur-xl border-b border-white/[0.05] transition-all duration-300">
          <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 rounded-2xl sm:rounded-full bg-stone-950/40 backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_2px_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_8px_36px_0_rgba(245,158,11,0.12)]">
            <div className="site-header__brand flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-600/40 flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/karmaraj_emblem.png"
                  alt="Karmaraj Emblem"
                  className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black font-title tracking-wide text-amber-300">
                    Karmaraj
                  </h1>
                  <span className="wax-stamp text-[9px] py-0.2 px-1.5 border-amber-500 text-amber-300 font-bold">
                    LIFE RPG
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">The Guild Bureaucracy</p>
              </div>
            </div>

            <div className="site-header__actions flex items-center gap-1.5 sm:gap-2.5">
              {/* World Weather Chip */}
              <div
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${todayWeather.accentBorder} bg-black/40 backdrop-blur-md shadow-inner cursor-help transition-all hover:scale-105`}
                title={`${todayWeather.name}: ${todayWeather.description}`}
              >
                <span className="text-sm">{todayWeather.icon}</span>
                <span style={{ color: todayWeather.color }}>{todayWeather.name}</span>
              </div>

              {/* Ambience Soundscape Toggle */}
              <button
                type="button"
                onClick={handleToggleAmbience}
                className={`p-2 rounded-full border transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm backdrop-blur-md ${
                  ambience === "hearth"
                    ? "bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : ambience === "dungeon"
                    ? "bg-blue-950/80 border-cyan-500 text-cyan-300 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : ambience === "tanpura"
                    ? "bg-purple-950/80 border-purple-400 text-purple-200 animate-pulse shadow-[0_0_14px_rgba(168,85,247,0.4)]"
                    : "bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-stone-400 hover:text-amber-300"
                }`}
                title={
                  ambience === "hearth"
                    ? "Ambience: Tavern Hearth (Click for Dungeon Echo)"
                    : ambience === "dungeon"
                    ? "Ambience: Dungeon Echo (Click for Meditative Tanpura 136.1Hz)"
                    : ambience === "tanpura"
                    ? "Ambience: Meditative Tanpura Drone 136.1Hz (Click to Silence)"
                    : "Enable Procedural Ambience (Hearth / Dungeon / Tanpura)"
                }
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Audio Mute Switch */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-stone-300 hover:text-amber-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm backdrop-blur-md"
                title={isMuted ? "Unmute Audio SFX (M)" : "Mute Audio SFX (M)"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Keyboard Shortcuts Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsHelpModalOpen(true);
                }}
                className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-stone-300 hover:text-amber-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm backdrop-blur-md"
                title="Arcane Keyboard Runes (?)"
              >
                <Keyboard className="w-4 h-4 text-amber-400" />
              </button>

              {/* 50-Day Cosmic Darshan Check-in Shrine */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsDarshanModalOpen(true);
                }}
                className="text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="50-Day Cosmic Darshan Check-in Shrine"
              >
                <span className="text-sm">☀️</span>
                <span className="hidden sm:inline font-bold">Darshan</span>
              </button>

              {/* Narrative Quest Scrolls */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsQuestScrollsModalOpen(true);
                }}
                className="text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 hover:border-orange-400 text-orange-300 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="Guild Narrative Quest Scrolls"
              >
                <span className="text-sm">📜</span>
                <span className="hidden sm:inline font-bold">Quests</span>
              </button>

              {/* Guild Community Challenges & Bounties */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsChallengesModalOpen(true);
                }}
                className="text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="Guild Community Challenges & Bounties"
              >
                <span className="text-sm">🏆</span>
                <span className="hidden sm:inline font-bold">Bounties</span>
              </button>

              {/* Chrono-Codex (Phase 7 Battle Pass) */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsCodexModalOpen(true);
                }}
                className="text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/40 hover:border-violet-400 text-violet-300 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="Chrono-Codex Seasonal Battle Pass"
              >
                <span className="text-sm">⏳</span>
                <span className="hidden sm:inline font-bold">
                  Codex T{Math.min(30, Math.floor((user?.chronoShards ?? 0) / 100))}
                </span>
              </button>

              {/* Relic Vault (Phase 5 Gacha) */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsVaultModalOpen(true);
                }}
                className="text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="Crack the Relic Vault (100g Gacha)"
              >
                <span className="text-sm">🗝️</span>
                <span className="hidden sm:inline font-bold">Vault</span>
              </button>

              {/* Pet & Mount Stable */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsPetModalOpen(true);
                }}
                className="text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-emerald-400/40 text-stone-200 hover:text-emerald-300 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="Manage Companions & Mounts"
              >
                <PawPrint className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline font-medium">Stable</span>
              </button>

              {/* Wheel of Fate */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsFateModalOpen(true);
                }}
                className="text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-amber-400/40 text-stone-200 hover:text-amber-300 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="Spin the Wheel of Unreasonable Fate"
              >
                <Dices className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline font-medium">Fate</span>
              </button>

              {/* Shop Bazaar */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsShopModalOpen(true);
                }}
                className="text-xs py-1.5 px-3.5 rounded-full flex items-center gap-1.5 bg-gradient-to-r from-amber-500/80 to-amber-600/80 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
                title="Visit Merchant Bazaar"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Bazaar</span>
              </button>

              {/* User Profile & Logout */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-stone-200">{user.username}</div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold">
                      Lvl {user.level} {(user.prestigeLevel ?? 0) > 0 && `★${user.prestigeLevel}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-red-950/40 border border-red-800/50 text-red-400 hover:bg-red-950/80 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
                    title="Sign out of Guild"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs py-1.5 px-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  Enter Guild
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Dashboard */}
        <main className="dashboard-main flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Faint Alert Banner */}
          {faintAlert && (
            <div className="p-4 rounded-xl bg-red-950/90 border-2 border-red-600 text-red-200 shadow-2xl flex items-center justify-between gap-4 animate-bounce">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💀</span>
                <div>
                  <div className="text-sm font-black tracking-wide">AVATAR COLLAPSE</div>
                  <div className="text-xs text-red-300">{faintAlert}</div>
                </div>
              </div>
              <button
                onClick={() => setFaintAlert(null)}
                className="px-3 py-1 bg-red-900/80 hover:bg-red-800 rounded-md text-xs font-bold border border-red-600"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Hero Vitals Header Bar */}
          {user && (
            <HeroVitalsHeader
              user={user}
              onToggleInn={handleToggleInn}
              onOpenClassSelect={() => setIsClassModalOpen(true)}
              onOpenParty={() => {
                const partyElement = document.getElementById("party-boss-section");
                if (partyElement) {
                  partyElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              onOpenStable={() => setIsPetModalOpen(true)}
            />
          )}

          {/* Active Class Skills Bar */}
          {user && (
            <ClassSkillsBar
              characterClass={user.characterClass || "WARRIOR"}
              currentMp={user.mp}
              onSkillCast={(res) => {
                setUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        hp: res.user.hp,
                        maxHp: res.user.maxHp,
                        mp: res.user.mp,
                        maxMp: res.user.maxMp,
                        xp: res.user.xp,
                        gold: res.user.gold,
                        level: res.user.level,
                      }
                    : null
                );
                fetchLogs();
              }}
            />
          )}

          {/* Search, Tag Filters & + Add Task Bar */}
          <div className="bg-[#1a1f26]/90 border border-[#2b3340] rounded-xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Tag Attribute Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
              {categories.map((cat) => {
                const isSelected = categoryFilter === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setCategoryFilter(cat.key);
                    }}
                    className={`inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full border transition-all whitespace-nowrap font-bold ${
                      isSelected
                        ? "shadow-sm"
                        : "bg-stone-900/90 text-stone-300 border-stone-800 hover:border-stone-700"
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: cat.color,
                            backgroundColor: `${cat.color}25`,
                            color: cat.color,
                          }
                        : undefined
                    }
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search and + Add Task button */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full bg-[#13161c] border border-stone-700 rounded-lg py-1.5 pl-9 pr-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setEditingTask(null);
                  setNewTaskDefaultType("HABIT");
                  setIsNewTaskModalOpen(true);
                }}
                className="btn-gold text-xs py-2 px-4 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Task</span>
              </button>
            </div>
          </div>

          {/* 4-COLUMN TASK BOARD GRID */}
          <section>
            <ErrorBoundary
              fallback={
                <div className="p-8 rounded-xl border border-stone-800 bg-stone-900/60 text-center space-y-2">
                  <p className="text-sm font-bold text-amber-300">Quest Board Synchronizing...</p>
                  <p className="text-xs text-stone-400">The task archives are momentarily refreshing. Please reload the page if this persists.</p>
                </div>
              }
            >
              <TaskBoardGrid
                habits={habits}
                dailies={dailies}
                todos={todos}
                rewards={rewards}
                userGold={user?.gold || 0}
                onScoreTask={handleScoreTask}
                onBuyStandardReward={handleBuyStandardReward}
                onQuickAddTask={handleQuickAddTask}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsNewTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onUpdateChecklist={handleUpdateChecklist}
              />
            </ErrorBoundary>
          </section>

          {/* Hero Relics & 3D Diorama & Radar */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-4">
            {/* 3D Diorama */}
            <div className="lg:col-span-5 diorama-box p-4 flex flex-col justify-between overflow-hidden border border-stone-800 shadow-2xl bg-[#161a20]">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold font-title text-amber-300">
                    Live 3D Hero Relic
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">Voxel Engine Active</span>
              </div>

              <ErrorBoundary
                fallback={
                  <div className="min-h-[300px] flex items-center justify-center text-center p-4 text-xs text-amber-200/80">
                    <div>
                      <p className="font-bold mb-1">Celestial Relic Offline</p>
                      <p className="text-[11px] text-stone-400">Resonating with astral frequencies...</p>
                    </div>
                  </div>
                }
              >
                <HeroDiorama3D
                  level={levelInfo.level}
                  xpProgress={levelInfo.progressPercent}
                  gold={user?.gold || 0}
                />
              </ErrorBoundary>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
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
            <section id="party-boss-section">
              <ErrorBoundary
                fallback={
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 text-xs text-stone-400 text-center">
                    Guild Warboard momentarily recharging its battle wards.
                  </div>
                }
              >
                <PartyBossWidget
                  currentUsername={user.username}
                  onBossDefeated={() => {
                    fetchCurrentUser();
                    fetchLogs();
                  }}
                />
              </ErrorBoundary>
            </section>
          )}

          {/* Samsara Cognitive Energy Heatmap & Purushartha Radar */}
          {user && (
            <section id="samsara-heatmap-section">
              <ErrorBoundary
                fallback={
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 text-xs text-stone-400 text-center">
                    Samsara Energy Matrix recalibrating...
                  </div>
                }
              >
                <SamsaraHeatmap
                  userStats={{
                    level: user.level,
                    hp: user.hp,
                    maxHp: user.maxHp,
                    mp: user.mp,
                    maxMp: user.maxMp,
                    streakCount: user.streakCount,
                    prestigeLevel: user.prestigeLevel,
                  }}
                />
              </ErrorBoundary>
            </section>
          )}

          {/* Quirks, Desk Goblin, Mimic & Chronicle */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <ErrorBoundary>
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
            </ErrorBoundary>
            <ErrorBoundary>
              <MimicChest onBonusGold={handleBonusGold} />
            </ErrorBoundary>
            <ErrorBoundary>
              <ActivityChronicle logs={logs} />
            </ErrorBoundary>
          </section>
        </main>

        <GhostAccent />

        {/* Modals */}
        <AuthModal
          isOpen={isAuthModalOpen && authChecked}
          onSuccess={(userData) => {
            setUser({
              ...userData,
              hp: userData.hp ?? 50,
              maxHp: userData.maxHp ?? 50,
              mp: userData.mp ?? 50,
              maxMp: userData.maxMp ?? 50,
              isSleeping: userData.isSleeping ?? false,
              currentPet: userData.currentPet ?? null,
              currentMount: userData.currentMount ?? null,
            });
            setIsAuthModalOpen(false);
            soundFx.playLevelUp();
          }}
        />

        <TaskEditorModal
          isOpen={isNewTaskModalOpen}
          onClose={() => {
            setIsNewTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          editingTask={editingTask}
          defaultType={newTaskDefaultType}
        />

        <StableModal
          isOpen={isPetModalOpen}
          onClose={() => setIsPetModalOpen(false)}
          userGold={user?.gold || 0}
          currentPet={user?.currentPet || null}
          currentMount={user?.currentMount || null}
          onPetEquipped={(petKey) => {
            setUser((prev) => (prev ? { ...prev, currentPet: petKey } : null));
          }}
          onGoldUpdated={(newGold) => {
            setUser((prev) => (prev ? { ...prev, gold: newGold } : null));
            fetchLogs();
          }}
        />

        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          newLevel={levelUpData?.level || 1}
          newTitle={levelUpData?.title || "Adventurer"}
        />

        <LootDropModal
          drop={currentLootDrop}
          onClose={() => setCurrentLootDrop(null)}
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

        <KeyboardShortcutsModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />

        {/* Phase 5: The Relic Vault (Gacha & Pity System) */}
        <RelicVaultModal
          isOpen={isVaultModalOpen}
          onClose={() => setIsVaultModalOpen(false)}
          userGold={user?.gold || 0}
          vaultPulls={user?.vaultPulls || 0}
          onPullSuccess={(updated) => {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    gold: updated.gold,
                    xp: updated.xp,
                    level: updated.level,
                    mp: updated.mp,
                    maxMp: updated.maxMp,
                    vaultPulls: updated.vaultPulls,
                    chronoShards: updated.chronoShards,
                  }
                : null
            );
            fetchLogs();
          }}
        />

        {/* Phase 7: Chrono-Codex Seasonal Battle Pass */}
        <ChronoCodexModal
          isOpen={isCodexModalOpen}
          onClose={() => setIsCodexModalOpen(false)}
          chronoShards={user?.chronoShards || 0}
          onRewardClaimed={(updated) => {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    gold: updated.gold,
                    xp: updated.xp,
                    hp: updated.hp,
                    maxHp: updated.maxHp,
                    mp: updated.mp,
                    maxMp: updated.maxMp,
                    title: updated.title,
                    level: updated.level,
                  }
                : null
            );
            fetchLogs();
          }}
        />

        {/* 50-Day Cosmic Darshan Check-in Calendar */}
        <CosmicDarshanModal
          isOpen={isDarshanModalOpen}
          onClose={() => setIsDarshanModalOpen(false)}
          onClaimSuccess={(updated) => {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    gold: updated.gold,
                    xp: updated.xp,
                    hp: updated.hp,
                    maxHp: updated.maxHp,
                    mp: updated.mp,
                    maxMp: updated.maxMp,
                    title: updated.title,
                    level: updated.level,
                  }
                : null
            );
            fetchLogs();
          }}
        />

        {/* Multi-Stage Narrative Quest Scrolls */}
        <QuestScrollsModal
          isOpen={isQuestScrollsModalOpen}
          onClose={() => setIsQuestScrollsModalOpen(false)}
          onRewardClaimed={(updated) => {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    gold: updated.gold,
                    xp: updated.xp,
                    level: updated.level,
                    chronoShards: updated.chronoShards ?? prev.chronoShards,
                  }
                : null
            );
            fetchLogs();
          }}
        />

        {/* Guild Community Challenges & Bounties */}
        <GuildChallengesModal
          isOpen={isChallengesModalOpen}
          onClose={() => setIsChallengesModalOpen(false)}
          onTasksChanged={() => {
            fetchTasks();
            fetchLogs();
          }}
        />

        {/* Hardware-Accelerated Cyber-Fantasy Cursor */}
        <CustomCursor />

        {/* Floating Combat Text (+XP, +Gold, Crits, Shards) */}
        <FloatingCombatText />

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

        {/* Tactical Apple Glass Full-Width Footer */}
        <footer className="w-full border-t border-white/[0.08] bg-stone-950/60 backdrop-blur-2xl py-5 px-4 sm:px-8 text-stone-400 mt-12 transition-all">
          <div className="w-full max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400/80 animate-pulse" />
              <span className="font-bold text-stone-200">Karmaraj</span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-400">Non-linear bureaucratic habit engine</span>
            </div>

            {/* Creator Credits & Professional Links */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-stone-400">
                Architected & Engineered by{" "}
                <span className="font-bold text-amber-300">Hardik (Sai Ram Dash)</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/ewwhardik/RPGWeb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-amber-300 transition-all font-mono text-[11px]"
                  title="View GitHub Repository"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/ewwhardik/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-sky-400/40 text-stone-300 hover:text-sky-300 transition-all font-mono text-[11px]"
                  title="Connect on LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-sky-400" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-stone-500 font-mono text-[11px]">v2.4 Production</span>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:text-amber-400 flex items-center gap-1.5 transition-all duration-200 hover:scale-105 font-mono text-[11px] px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40"
              >
                <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-300 text-[10px] font-bold">
                  ?
                </kbd>
                <span>Arcane Runes</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
