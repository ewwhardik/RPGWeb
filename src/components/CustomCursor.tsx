"use client";

import React, { useEffect, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [cursorMode, setCursorMode] = useState<"default" | "attack" | "cast" | "quill" | "pointer">("default");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch-only device
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let targetX = -100;
    let targetY = -100;
    let animFrameId: number;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Detect hover target attributes
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorAttr = target.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (cursorAttr === "attack") {
        setCursorMode("attack");
      } else if (cursorAttr === "cast") {
        setCursorMode("cast");
      } else if (cursorAttr === "quill") {
        setCursorMode("quill");
      } else if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        setCursorMode("quill");
      } else if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button"
      ) {
        setCursorMode("pointer");
      } else {
        setCursorMode("default");
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Smooth lerp rendering loop
    const render = () => {
      mouseX += (targetX - mouseX) * 0.45;
      mouseY += (targetY - mouseY) * 0.45;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      animFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animFrameId);
    };
  }, [isVisible]);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 450);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (isTouch || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Click Shockwave Ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/80 animate-ping pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: 32,
            height: 32,
            animationDuration: "420ms",
            boxShadow: "0 0 15px rgba(251, 191, 36, 0.6)",
          }}
        />
      ))}

      {/* Main Cursor Element */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 will-change-transform"
      >
        {cursorMode === "default" && (
          <div className="relative group">
            {/* Ambient Rune Halo */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-cyan-500/20 rounded-full blur-[6px] animate-pulse pointer-events-none" />
            <svg
              className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] filter transition-all duration-150"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 3 10 21 13 13 21 10 3 3" fill="#0f172a" fillOpacity="0.8" />
              <circle cx="12" cy="12" r="1.5" fill="#38bdf8" />
            </svg>
          </div>
        )}

        {cursorMode === "attack" && (
          <div className="relative">
            {/* Runic Broadsword */}
            <div className="absolute -inset-3 bg-red-600/30 rounded-full blur-[8px] animate-pulse" />
            <svg
              className="w-8 h-8 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] -rotate-45"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14.5 2.5l7 7-9.5 9.5H8v-4l6.5-6.5-2.5-2.5 2.5-3.5zm-8 17.5l-4 4 1.5 1.5 4-4-1.5-1.5z" />
            </svg>
            <span className="absolute -bottom-4 left-6 text-[9px] font-mono tracking-widest text-red-400 uppercase font-black px-1 py-0.5 rounded bg-black/80 border border-red-500/40">
              STRIKE
            </span>
          </div>
        )}

        {cursorMode === "cast" && (
          <div className="relative">
            {/* Mystic Catalyst */}
            <div className="absolute -inset-3 bg-cyan-500/40 rounded-full blur-[10px] animate-spin" />
            <svg
              className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)] animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2" fill="#0369a1" fillOpacity="0.5" />
            </svg>
            <span className="absolute -bottom-4 left-6 text-[9px] font-mono tracking-widest text-cyan-300 uppercase font-black px-1 py-0.5 rounded bg-black/80 border border-cyan-500/40">
              CHANNELED
            </span>
          </div>
        )}

        {cursorMode === "quill" && (
          <div className="relative">
            {/* Cyber-Quill Stylus */}
            <div className="absolute -inset-2 bg-emerald-500/30 rounded-full blur-[6px]" />
            <svg
              className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] -rotate-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" fill="#10b981" />
            </svg>
            <span className="absolute -bottom-4 left-6 text-[9px] font-mono tracking-widest text-emerald-300 uppercase font-black px-1 py-0.5 rounded bg-black/80 border border-emerald-500/40">
              INSCRIPTION
            </span>
          </div>
        )}

        {cursorMode === "pointer" && (
          <div className="relative scale-110 transition-transform">
            <div className="absolute -inset-2 bg-amber-400/40 rounded-full blur-[7px] animate-pulse" />
            <svg
              className="w-6 h-6 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 3 10 21 13 13 21 10 3 3" fill="#f59e0b" fillOpacity="0.4" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
