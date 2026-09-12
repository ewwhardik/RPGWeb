"use client";

import React from "react";
import { soundFx } from "@/lib/audio";

interface TactileToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  leftIcon?: React.ReactNode;
}

export default function TactileToggle({
  checked,
  onChange,
  label,
  leftIcon,
}: TactileToggleProps) {
  function handleToggle() {
    soundFx.playClick();
    onChange(!checked);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center gap-2 cursor-pointer select-none group"
      aria-label={label || "Toggle"}
    >
      {leftIcon && <span className="text-slate-400 group-hover:text-slate-200">{leftIcon}</span>}
      {label && <span className="text-xs font-semibold text-slate-300">{label}</span>}

      {/* Tactile 3D Switch Track */}
      <div
        className={`w-11 h-6 rounded-full p-0.5 border transition-all duration-200 relative ${
          checked
            ? "bg-amber-500 border-amber-600 shadow-inner"
            : "bg-[#0b0e14] border-slate-700 shadow-inner"
        }`}
      >
        {/* Switch Knob */}
        <div
          className={`w-4 h-4 rounded-full bg-slate-100 shadow-md transform transition-transform duration-200 ${
            checked ? "translate-x-5 bg-slate-950" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
