"use client";

import React, { useState } from "react";
import { Shield, Sparkles, Sword, User, Lock, Mail, ChevronRight, Wand2, Axe, Compass } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (userData: any) => void;
  onClose?: () => void;
}

const AVATARS = [
  { id: "warrior", name: "Gym Berserker", icon: Axe, desc: "Lifts heavy things. Ignores rest days." },
  { id: "mage", name: "Code Sorcerer", icon: Wand2, desc: "Conjures bugs and curses the compiler." },
  { id: "rogue", name: "Chore Assassin", icon: Sword, desc: "Speedruns laundry at 2:00 AM." },
  { id: "paladin", name: "Discipline Knight", icon: Shield, desc: "Has never hit snooze. Probably lying." },
  { id: "scout", name: "Life Explorer", icon: Compass, desc: "Touches grass. Remembers sunlight." },
];

export default function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("warrior");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { login: email || username, password }
        : { username, email, password, avatar: selectedAvatar };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "The guild scribe dropped the ink pot. Try again.");
      } else {
        onSuccess(data.user);
      }
    } catch {
      setErrorMsg("Network goblins cut the connection cords. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  // Demo account for judges / fast review
  async function handleDemoLogin() {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: "adventurer",
          password: "password123",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If demo user doesn't exist, create it automatically!
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "adventurer",
            email: "adventurer@guild.rpg",
            password: "password123",
            avatar: "warrior",
          }),
        });
        const regData = await regRes.json();
        if (regRes.ok) {
          onSuccess(regData.user);
        } else {
          setErrorMsg(regData.error || "Demo registration failed.");
        }
      } else {
        onSuccess(data.user);
      }
    } catch {
      setErrorMsg("Could not summon demo character.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rpg-panel border border-[#b45309]/50 bg-[#121822] p-6 shadow-2xl relative overflow-hidden">
        {/* Top Decorative Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-300 tracking-wide">
                {isLogin ? "Adventurer Sign-In" : "Guild Enlistment Desk"}
              </h2>
              <p className="text-xs text-slate-400">
                {isLogin
                  ? "Present your guild pass to resume your heroic duties."
                  : "Sign your name in blood (or ink) to begin earning XP."}
              </p>
            </div>
          </div>

          <div className="flex bg-[#0b0e14] p-1 rounded-lg border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMsg("");
              }}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                !isLogin ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Enlist
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMsg("");
              }}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                isLogin ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
            <span className="font-bold text-red-400">Notice:</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Heroic Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Sir Clutterbane"
                    className="w-full bg-[#0b0e14] border border-slate-700/70 rounded-md py-2 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Choose Class Archetype
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map((av) => {
                    const Icon = av.icon;
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 scale-105"
                            : "bg-[#0b0e14] border-slate-700/70 text-slate-400 hover:border-slate-500"
                        }`}
                        title={av.desc}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium leading-tight line-clamp-1">
                          {av.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isLogin ? "Heroic Name or Royal Email Scroll" : "Royal Email Scroll"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type={isLogin ? "text" : "email"}
                required
                value={isLogin ? username || email : email}
                onChange={(e) => {
                  if (isLogin) {
                    setUsername(e.target.value);
                    setEmail(e.target.value);
                  } else {
                    setEmail(e.target.value);
                  }
                }}
                placeholder={isLogin ? "Email or adventurer username" : "adventurer@realm.com"}
                className="w-full bg-[#0b0e14] border border-slate-700/70 rounded-md py-2 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Secret Pass-Phrase
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 secure runes..."
                className="w-full bg-[#0b0e14] border border-slate-700/70 rounded-md py-2 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center text-sm"
            >
              {loading ? (
                "Consulting the High Scribe..."
              ) : isLogin ? (
                <>
                  <span>Enter the Guild Hall</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Seal Enlistment (Claim 50 Gold)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn-dark w-full text-xs text-amber-200/90 py-2 border-amber-900/40"
            >
              Instant Demo Login (Evaluator Fast-Track)
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            {isLogin ? "First time questing?" : "Already hold a guild insignia?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg("");
              }}
              className="text-amber-400 hover:underline font-semibold"
            >
              {isLogin ? "Sign up here" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
