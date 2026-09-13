"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Lock,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Axe,
  Wand2,
  Sword,
  Compass,
  Flame,
  KeyRound,
  Trash2,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "@/components/FloatingCombatText";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    username: string;
    email: string;
    title?: string;
    avatar?: string;
    level: number;
    streakCount: number;
    characterClass?: string;
  } | null;
  onProfileUpdated: (updatedUser: any) => void;
  onAccountDeleted: () => void;
}

const AVATAR_CHOICES = [
  { id: "warrior", name: "Gym Berserker", icon: Axe, color: "text-red-400 border-red-500/40" },
  { id: "mage", name: "Code Sorcerer", icon: Wand2, color: "text-blue-400 border-blue-500/40" },
  { id: "rogue", name: "Chore Assassin", icon: Sword, color: "text-amber-400 border-amber-500/40" },
  { id: "paladin", name: "Discipline Knight", icon: Shield, color: "text-emerald-400 border-emerald-500/40" },
  { id: "scout", name: "Life Explorer", icon: Compass, color: "text-cyan-400 border-cyan-500/40" },
];

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onAccountDeleted,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "danger">("profile");

  // Profile fields
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("warrior");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Danger fields
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setTitle(currentUser.title || "Novice Procrastinator");
      setSelectedAvatar(currentUser.avatar || "warrior");
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  function clearMessages() {
    setSuccessMsg("");
    setErrorMsg("");
  }

  // Handle Profile Update
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          title: title.trim(),
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update profile.");
        soundFx.playClick();
      } else {
        setSuccessMsg(data.message || "Identity scroll updated successfully!");
        soundFx.playLevelUp();
        spawnCombatText("✨ CREDENTIALS RE-SEALED!", "gold");
        onProfileUpdated(data.user);
      }
    } catch {
      setErrorMsg("Network disruption. Scribe could not save your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Password Change
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 6) {
      setErrorMsg("New passcode must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passcodes do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update passcode.");
        soundFx.playClick();
      } else {
        setSuccessMsg(data.message || "Passcode successfully updated!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        soundFx.playLevelUp();
        spawnCombatText("🔐 PASSCODE RE-FORGED!", "vedic");
      }
    } catch {
      setErrorMsg("Connection failure while updating cipher seal.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Account Deletion
  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setErrorMsg("You must type DELETE to confirm account removal.");
      return;
    }
    if (!deletePassword) {
      setErrorMsg("Please enter your current passcode to authorize erasure.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationText: deleteConfirmText.trim(),
          password: deletePassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to delete account.");
        soundFx.playClick();
      } else {
        soundFx.playClick();
        spawnCombatText("💨 ACCOUNT DISSOLVED INTO ASTRAL ETHER", "damage");
        onAccountDeleted();
        onClose();
      }
    } catch {
      setErrorMsg("Connection failure while dissolving ledger records.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0e1217] border-2 border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-[#13171f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-title text-stone-100 flex items-center gap-2">
                Account Management
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LVL {currentUser.level}
                </span>
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                Manage your credentials, security cipher, and guild records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-[#11151c] px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              clearMessages();
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Identity</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              clearMessages();
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === "password"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Passcode & Cipher</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("danger");
              clearMessages();
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === "danger"
                ? "border-red-500 text-red-400"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Danger Zone</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Notification Messages */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & IDENTITY */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Guild Handle / Username */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 font-bold">
                  GUILD HANDLE / USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. DharmaWarrior"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  required
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  3–25 alphanumeric characters, hyphens, and underscores. Appears on the live leaderboard.
                </p>
              </div>

              {/* Title / Epithet */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 font-bold">
                  HERO TITLE / EPITHET
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master of Focus"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Your customized honorific, displayed beneath your avatar in the tavern.
                </p>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-2 font-bold">
                  HERO AVATAR ARCHETYPE
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVATAR_CHOICES.map((av) => {
                    const Icon = av.icon;
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] scale-[1.02]"
                            : "bg-stone-900/60 border-stone-800 hover:border-stone-700"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-stone-800 ${av.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-stone-200">{av.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Registered Email (Read-only) */}
              <div className="pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>REGISTERED EMAIL:</span>
                  <span className="text-stone-200 font-medium">{currentUser.email}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Inscribing into Ledger...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save Identity Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PASSCODE & SECURITY */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Passcode */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 font-bold">
                  CURRENT PASSCODE
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your existing passcode"
                    className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-400 transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Passcode */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 font-bold">
                  NEW PASSCODE
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-400 transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-stone-400">Cipher Strength:</span>
                    <span
                      className={`font-bold ${
                        newPassword.length >= 10
                          ? "text-emerald-400"
                          : newPassword.length >= 6
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {newPassword.length >= 10
                        ? "Arcane Fortress (High)"
                        : newPassword.length >= 6
                        ? "Adequate Seal (Medium)"
                        : "Vulnerable (Min 6 chars)"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Passcode */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 font-bold">
                  CONFIRM NEW PASSCODE
                </label>
                <input
                  type={showNewPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new passcode"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Sealing New Cipher...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Update Arcane Passcode</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DANGER ZONE */}
          {activeTab === "danger" && (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>PERMANENT EXPUNGEMENT OF CHARACTER</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Dissolving your account permanently wipes your hero avatar, Level {currentUser.level} stats,
                  all daily tasks, habits, gold, inventory items, battle pass shards, and party records from
                  the PostgreSQL database.
                </p>
                <p className="text-xs text-red-300 font-bold">
                  ⚠️ This action is irreversible. No celestial magic can restore your ledger once deleted.
                </p>
              </div>

              {/* Confirmation Phrase */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 font-bold">
                  TYPE <span className="text-red-400">DELETE</span> TO CONFIRM:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-red-800/70 rounded-xl text-red-200 text-sm focus:outline-none focus:border-red-500 font-mono tracking-wider"
                  required
                />
              </div>

              {/* Password Authorization */}
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 font-bold">
                  ENTER YOUR PASSCODE TO AUTHORIZE:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current passcode"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-stone-100 font-black text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Dissolving Records...</span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Permanently Delete Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
