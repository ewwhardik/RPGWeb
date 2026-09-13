"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Sparkles, Volume2, VolumeX, ArrowRight, Check } from "lucide-react";
import { soundFx } from "@/lib/audio";

interface MeghnaWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MeghnaWelcomeModal({
  isOpen,
  onClose,
}: MeghnaWelcomeModalProps) {
  const [step, setStep] = useState<"ASKING" | "EXPLAINING" | "FINISHED">("ASKING");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play Audio 1 when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    setStep("ASKING");

    const audio1 = new Audio("/assets/audio1.mp3");
    audio1.preload = "auto";
    audioRef.current = audio1;

    audio1.onplay = () => setIsPlaying(true);
    audio1.onended = () => setIsPlaying(false);
    audio1.onerror = () => {
      // Fallback path in case /assets/ vs /assests/
      const fallback = new Audio("/assests/audio1.mp3");
      audioRef.current = fallback;
      fallback.play().catch(() => {});
    };

    // Auto-play Audio 1
    const playPromise = audio1.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked by browser policy until user interacts
          setIsPlaying(false);
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle "Yes" click -> Stop Audio 1, Play Audio 2, Show "..." animation
  const handleYes = () => {
    soundFx.playClick();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setStep("EXPLAINING");

    const audio2 = new Audio("/assets/audio2.mp3");
    audio2.preload = "auto";
    audioRef.current = audio2;

    audio2.onplay = () => setIsPlaying(true);
    audio2.onended = () => {
      setIsPlaying(false);
      setStep("FINISHED");
    };
    audio2.onerror = () => {
      const fallback = new Audio("/assests/audio2.mp3");
      audioRef.current = fallback;
      fallback.play().catch(() => {});
    };

    audio2.play().catch(() => setIsPlaying(false));
  };

  // Close and NEVER comeback
  const handleClose = () => {
    soundFx.playClick();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      localStorage.setItem("karmaraj_meghna_dismissed", "true");
      localStorage.removeItem("karmaraj_just_signed_up");
    } catch {}

    onClose();
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-2xl transition-all duration-500 animate-in fade-in">
      {/* Background ambient ethereal glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/20 via-orange-500/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 z-10">
        {/* Left / Center: Meghna Character (girl.png) */}
        <div className="relative flex-shrink-0 group">
          {/* Radiant Halo behind Meghna */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/25 to-orange-600/30 rounded-full blur-2xl transform scale-90 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/girl.png"
            alt="Meghna - Guild Guide"
            onError={(e) => {
              // Fallback to /assests/girl.png if needed
              (e.target as HTMLImageElement).src = "/assests/girl.png";
            }}
            className="relative z-10 max-h-[42vh] sm:max-h-[55vh] md:max-h-[68vh] w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] select-none animate-float"
          />

          {/* Audio Speaking Ring indicator */}
          {isPlaying && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/90 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.4)] text-[11px] font-mono font-bold text-amber-300">
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Speaking...</span>
            </div>
          )}
        </div>

        {/* Right / Speech Bubble Message Box */}
        <div className="relative w-full max-w-lg bg-[#0d1117]/95 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-xl">
          {/* Header row: Speaker Name & Close (X) */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center p-0.5 shadow-md">
                <Sparkles className="w-4 h-4 text-stone-950" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black font-title text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 drop-shadow-sm">
                  Meghna
                </h3>
                <span className="text-[10px] font-mono font-bold text-amber-400/90 uppercase tracking-widest">
                  Guild Guide
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Mute / Unmute Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                className="p-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-300 transition-colors"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Close Button (Never Comes Back) */}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl bg-stone-900/80 hover:bg-red-950/40 border border-stone-700 hover:border-red-600/50 text-stone-400 hover:text-red-400 transition-colors"
                title="Close & Never Show Again"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP 1: ASKING */}
          {step === "ASKING" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-serif italic text-stone-100 leading-relaxed drop-shadow-sm">
                  &ldquo;Hello, I am Meghna. Do you want to know more about Karmaraj?&rdquo;
                </p>
                <p className="text-xs text-stone-400 font-sans leading-relaxed">
                  I can guide you through the realm, explain quests and battle raids, and help you awaken your highest potential.
                </p>
              </div>

              {/* Action Buttons: Close (Never again) vs Yes */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-xs font-bold text-stone-400 hover:text-stone-200 transition-all text-center order-2 sm:order-1"
                >
                  No, thanks (Close)
                </button>

                <button
                  type="button"
                  onClick={handleYes}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 order-1 sm:order-2"
                >
                  <span>Yes, tell me more!</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EXPLAINING (with animated "..." and voice narration) */}
          {(step === "EXPLAINING" || step === "FINISHED") && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Animated Speaking / "..." Indicator */}
              <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/25 px-3.5 py-2 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {step === "EXPLAINING" ? "Meghna is explaining Karmaraj" : "Orientation Complete"}
                  </span>
                </div>

                {/* Animated "..." Dots */}
                {step === "EXPLAINING" && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                  </div>
                )}

                {step === "FINISHED" && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> All caught up
                  </span>
                )}
              </div>

              {/* Karmaraj Lore & Overview Subtitles */}
              <div className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans space-y-2.5 bg-black/40 p-3.5 rounded-2xl border border-white/5">
                <p>
                  <strong className="text-amber-300 font-bold">Karmaraj</strong> transforms your daily habits, duties, and deep work into an epic Life RPG.
                </p>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Conquer daily tasks to gain XP, Gold, and Mana. Battle procrastination beasts in cooperative guild raids, hatch celestial pets, and unlock ancient relics from the vault!
                </p>
              </div>

              {/* Enter Realm Button */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Enter Karmaraj Realm</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
