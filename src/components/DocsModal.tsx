"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Code2,
  Cpu,
  Layers,
  Swords,
  Clock,
  Compass,
  Sparkles,
  ExternalLink,
  Keyboard,
  Shield,
  Zap,
  LineChart,
} from "lucide-react";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocTab =
  | "manifesto"
  | "architecture"
  | "mechanics"
  | "telemetry"
  | "productivity"
  | "weather-chronos"
  | "guild-raids"
  | "shortcuts"
  | "author";

export default function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const [activeTab, setActiveTab] = useState<DocTab>("manifesto");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0e1217] border-2 border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-stone-100">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#13171f] border-b md:border-b-0 md:border-r border-stone-800 p-4 sm:p-5 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-title text-stone-100">Karmaraj Docs</h3>
                <p className="text-[10px] font-mono text-stone-400">v2.0 • Grandmaster Edition</p>
              </div>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("manifesto")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "manifesto"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Manifesto & Vision</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("architecture")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "architecture"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Architecture & Stack</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mechanics")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "mechanics"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Game Mathematics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("telemetry")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "telemetry"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <LineChart className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Telemetry & Real Graphs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("productivity")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "productivity"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Pomodoro & Galleries</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("weather-chronos")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "weather-chronos"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Weather & Chronos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("guild-raids")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "guild-raids"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Swords className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Guild Raids & Webhooks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("shortcuts")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "shortcuts"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Keyboard className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Keyboard Shortcuts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("author")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left whitespace-nowrap ${
                  activeTab === "author"
                    ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                }`}
              >
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Creator & License</span>
              </button>
            </nav>
          </div>

          {/* Quick External Links */}
          <div className="hidden md:flex flex-col gap-2 pt-4 border-t border-stone-800 text-[11px] font-mono">
            <a
              href="https://github.com/ewwhardik/RPGWeb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-stone-400 hover:text-stone-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-stone-300" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub Repo</span>
              </span>
              <ExternalLink className="w-3 h-3 text-stone-500" />
            </a>
            <a
              href="https://www.linkedin.com/in/ewwhardik/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-stone-400 hover:text-stone-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
              </span>
              <ExternalLink className="w-3 h-3 text-stone-500" />
            </a>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto relative scrollbar-thin">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors border border-stone-700"
          >
            <X className="w-4 h-4" />
          </button>

          {/* TAB 1: MANIFESTO */}
          {activeTab === "manifesto" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 01 • Product Philosophy
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Karmaraj: Bridging the Delayed Feedback Void
                </h1>
              </div>

              <div className="prose prose-invert prose-stone text-xs sm:text-sm leading-relaxed space-y-4">
                <p>
                  Modern human endeavors—learning Rust or distributed computing, mastering deadlifts, writing a thesis, or shipping software—suffer from <strong>delayed feedback latency</strong>. You can grind for four consecutive weeks without receiving a single neurochemical reward.
                </p>
                <p>
                  Meanwhile, mobile apps and social algorithms provide instant dopamine loops in 200 milliseconds. This evolutionary mismatch causes brilliant minds to fall into cycles of involuntary procrastination.
                </p>
                <div className="bg-[#141922] p-4 rounded-2xl border border-amber-500/25 text-amber-200/90 text-xs">
                  <strong>The Karmaraj Thesis:</strong> By architecting an RPG feedback layer with Next.js 16, Three.js WebGL, and Web Audio synthesizers directly over your everyday productivity, delayed obligations produce instant, tactile satisfaction.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE */}
          {activeTab === "architecture" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 02 • Technical Specifications
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Full-Stack Architecture & Engineering
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#141922] p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    <span>Next.js 16 + React 19</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Turbopack zero-bundle dev builds, Server Actions, Route Handlers, and React Server Components for maximum runtime velocity.
                  </p>
                </div>

                <div className="bg-[#141922] p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Three.js 3D Diorama</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    WebGL Anatomical Eye with reactive gaze tracking, procedural corneal refractions, and a resilient 2.5D SVG/CSS fallback.
                  </p>
                </div>

                <div className="bg-[#141922] p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Hybrid Web Audio Synthesizer</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Cosmic Om 136.1Hz Tanpura drone, 432Hz temple ghanta bells, and tactile keyboard thock sound engineering.
                  </p>
                </div>

                <div className="bg-[#141922] p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Prisma 6.4 + SQLite / Postgres</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    ACID compliant schema with multi-column task indexes, user pet stables, and battle logs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GAME MATHEMATICS */}
          {activeTab === "mechanics" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 03 • Game Balance & Formulas
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Progression Mathematics & Formulas
                </h1>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-[#141922] p-4 rounded-2xl border border-stone-800 space-y-2 font-mono text-[11px]">
                  <div className="font-bold text-amber-300 text-xs font-sans">1. Level Threshold Formula</div>
                  <div className="text-stone-300 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    Level(XP) = Math.floor(XP / (Level * 100)) + 1
                  </div>
                  <p className="text-stone-400 text-[11px] font-sans">
                    Guarantees non-linear progression where higher levels require sustained weekly commitment.
                  </p>
                </div>

                <div className="bg-[#141922] p-4 rounded-2xl border border-stone-800 space-y-2 font-mono text-[11px]">
                  <div className="font-bold text-amber-300 text-xs font-sans">2. Habit Score Multiplier</div>
                  <div className="text-stone-300 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    GoldReward = BaseReward * (1 + Streak * 0.05) * DifficultyMultiplier
                  </div>
                  <p className="text-stone-400 text-[11px] font-sans">
                    Difficulty multipliers: TRIVIAL (0.8x), EASY (1.0x), MEDIUM (1.5x), HARD (2.0x).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TELEMETRY & REAL GRAPHS */}
          {activeTab === "telemetry" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 04 • Real-Data Telemetry Engine
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Interactive SVG Telemetry & Spider Radar
                </h1>
              </div>

              <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
                <p>
                  Karmaraj replaces static mock graphics with an authentic, client-rendered mathematical telemetry suite. Every graph is calculated in real time from database activity logs (`/api/logs`) and live task state.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800 space-y-1.5">
                    <h4 className="font-bold text-amber-300">1. 14-Day Velocity Area Curve</h4>
                    <p className="text-[11px] text-stone-400">
                      Cubic spline area charts comparing daily XP velocity with cumulative trajectory, complete with interactive hover data points.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800 space-y-1.5">
                    <h4 className="font-bold text-emerald-300">2. 7-Day Habit Completion Matrix</h4>
                    <p className="text-[11px] text-stone-400">
                      Calculates weekly success ratios and completion volumes across all four columns with dynamic SVG progress bars.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800 space-y-1.5">
                    <h4 className="font-bold text-cyan-300">3. Hexagonal Vedic Spider Radar</h4>
                    <p className="text-[11px] text-stone-400">
                      Pure SVG 6-axis polygon visualizing equilibrium across Strength, Intellect, Vitality, Dexterity, Charisma, and Sanity.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800 space-y-1.5">
                    <h4 className="font-bold text-purple-300">4. Purushartha 4-Pillar Wheel</h4>
                    <p className="text-[11px] text-stone-400">
                      Dharma (Duty), Artha (Productivity), Kama (Well-being), and Moksha (Mindfulness) telemetry balanced via quadratic Bezier arcs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800 space-y-1.5">
                    <h4 className="font-bold text-amber-300">5. 30-Day Growth Trajectory</h4>
                    <p className="text-[11px] text-stone-400">
                      Linear regression line plotting total accumulated character XP over 30 days, detecting momentum surges or stagnation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800 space-y-1.5">
                    <h4 className="font-bold text-rose-300">6. Circadian Focus Peak Hours</h4>
                    <p className="text-[11px] text-stone-400">
                      24-hour distribution histogram analyzing when the user completes habits to reveal optimal biological focus windows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POMODORO & GALLERIES */}
          {activeTab === "productivity" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 05 • Chrono Focus & Productivity Architecture
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Productivity Galleries & Pomodoro Chamber
                </h1>
              </div>

              <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
                <p>
                  Architected as a modular dark fantasy productivity workspace by Hardik (Sai Ram Dash), Karmaraj provides pixel art gallery views that visually elevate your daily routine into collectible art.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800">
                    <h4 className="font-bold text-emerald-300 mb-1">Good Habits Gallery</h4>
                    <p className="text-[11px] text-stone-400">
                      Pixel art cards for Deep Work, Workout, Healthy Diet, Reading, and Journaling with direct XP earnings.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800">
                    <h4 className="font-bold text-rose-300 mb-1">Bad Habits Danger Zone</h4>
                    <p className="text-[11px] text-stone-400">
                      Clear warnings with action buttons to penalize slips, raise Boss Rage, and maintain self-awareness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WEATHER & CHRONOS */}
          {activeTab === "weather-chronos" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 06 • Real-World Grounding
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Live Weather & Life Elapsed Chronos
                </h1>
              </div>

              <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
                <p>
                  Gamification fails when disconnected from physical reality. Karmaraj grounds you using live local telemetry anchored to physical space and time:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-[11px] text-stone-400">
                  <li>
                    <strong>Primary Anchor & Geolocation:</strong> Defaulted to <strong>Bhubaneswar, Odisha, India</strong> (<code className="text-amber-400 font-mono">20.2961° N, 85.8245° E</code>), the historic Temple City of India. Automatically queries Open-Meteo for real-time temperature, WMO weather codes, and 7-day meteorological forecasts with seamless °C/°F toggles.
                  </li>
                  <li>
                    <strong>Precision Analog Chronometer:</strong> Real-time SVG second-hand movement calibrated to your browser clock, tracking time with authentic mechanical rhythm.
                  </li>
                  <li>
                    <strong>Memento Mori Life Elapsed Meters:</strong> Real-time progress bars showing exactly how much of the Year, Month, Week, and Day has elapsed, turning abstract time into tangible urgency.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 7: GUILD RAIDS */}
          {activeTab === "guild-raids" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 07 • Social Accountability
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Cooperative Boss Raids & Webhooks
                </h1>
              </div>

              <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
                <p>
                  Slay mythic procrastination titans (Kumbhakarna, Mahishasura, Rahu, Maya) collaboratively:
                </p>
                <div className="p-3.5 rounded-2xl bg-[#141922] border border-stone-800 space-y-2">
                  <div className="font-bold text-amber-300">Procedural 3-Phase Boss AI:</div>
                  <div className="text-[11px] text-stone-400 space-y-1">
                    <div>🛡️ <strong>Phase 1: Sthira</strong> (&gt;60% HP) - Standard defense.</div>
                    <div>🔮 <strong>Phase 2: Maya Shield</strong> (25%-60% HP) - Physical strikes deflected; only INTELLECT & SANITY tasks pierce!</div>
                    <div>🔥 <strong>Phase 3: Krodha Enrage</strong> (&le;25% HP) - 2x Boss Rage buildup on missed dailies.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 08 • Efficiency Hotkeys
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Keyboard Shortcuts Reference
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141922] border border-stone-800">
                  <span className="text-stone-300">Create New Quest</span>
                  <kbd className="px-2 py-1 rounded bg-black/60 border border-stone-700 text-amber-400">N</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141922] border border-stone-800">
                  <span className="text-stone-300">Toggle Audio Mute</span>
                  <kbd className="px-2 py-1 rounded bg-black/60 border border-stone-700 text-amber-400">M</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141922] border border-stone-800">
                  <span className="text-stone-300">Open Tavern Shop</span>
                  <kbd className="px-2 py-1 rounded bg-black/60 border border-stone-700 text-amber-400">S</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141922] border border-stone-800">
                  <span className="text-stone-300">Rest at Guild Inn</span>
                  <kbd className="px-2 py-1 rounded bg-black/60 border border-stone-700 text-amber-400">I</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141922] border border-stone-800">
                  <span className="text-stone-300">Wheel of Fate</span>
                  <kbd className="px-2 py-1 rounded bg-black/60 border border-stone-700 text-amber-400">W</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141922] border border-stone-800">
                  <span className="text-stone-300">Close Active Modal</span>
                  <kbd className="px-2 py-1 rounded bg-black/60 border border-stone-700 text-amber-400">Esc</kbd>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AUTHOR & LICENSE */}
          {activeTab === "author" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  Document 09 • Creator Attribution & License
                </span>
                <h1 className="text-2xl font-black font-title text-stone-100 mt-1">
                  Architected & Built by Hardik (Sai Ram Dash)
                </h1>
              </div>

              <div className="bg-[#141922] p-5 rounded-2xl border border-stone-800 space-y-4">
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  <strong>Karmaraj: The Life RPG</strong> was conceptualized, architected, and engineered from scratch by <strong>Hardik (Sai Ram Dash)</strong>.
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Every component—from the Next.js 16 Turbopack pipeline, the Three.js reactive anatomical diorama, the Web Audio classical Tanpura synthesizer, the procedural mythic boss raid AI, to the Chrono Focus productivity suite—was crafted to make human self-improvement engaging and indelible.
                </p>

                <div className="p-3.5 rounded-xl bg-black/40 border border-stone-800 space-y-1 text-xs">
                  <div className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open-Source License: Apache License 2.0</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Copyright © 2026 Hardik (Sai Ram Dash). All rights reserved. Free for personal, commercial, academic, and open-source contribution under the terms of the Apache 2.0 License.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://github.com/ewwhardik/RPGWeb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold font-mono flex items-center gap-2 transition-colors border border-stone-700"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>GitHub: ewwhardik/RPGWeb</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/ewwhardik/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#0A66C2] text-xs font-bold font-mono flex items-center gap-2 transition-colors border border-[#0A66C2]/40"
                  >
                    <svg className="w-4 h-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span>LinkedIn: /in/ewwhardik</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
