"use client";

import React from "react";
import { Scroll, Sparkles, Award, ShoppingBag, Flame } from "lucide-react";

interface ActivityLogItem {
  id: string;
  actionType: string;
  message: string;
  xpChange: number;
  goldChange: number;
  createdAt: string;
}

interface ActivityChronicleProps {
  logs: ActivityLogItem[];
}

export default function ActivityChronicle({ logs }: ActivityChronicleProps) {
  function getIcon(actionType: string) {
    switch (actionType) {
      case "LEVEL_UP":
        return <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />;
      case "QUEST_COMPLETED":
        return <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />;
      case "ITEM_PURCHASED":
        return <ShoppingBag className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300" />;
      case "WHEEL_OF_FATE":
        return <Flame className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />;
      default:
        return <Scroll className="w-3.5 h-3.5 text-stone-600 dark:text-slate-400" />;
    }
  }

  return (
    <div className="rpg-panel border border-stone-200 dark:border-slate-800 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 pb-2.5 border-b border-stone-200 dark:border-slate-800 mb-3">
        <Scroll className="w-4 h-4 text-amber-700 dark:text-amber-400" />
        <h3 className="text-xs font-bold font-title text-stone-900 dark:text-slate-100 uppercase tracking-wider">
          Guild Chronicle
        </h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-stone-500 dark:text-slate-400 py-4 text-center italic">
          The ink is still dry. Complete a quest to start your chronicle!
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-stone-50/80 dark:bg-background border border-stone-200/80 dark:border-slate-800/80 flex items-start gap-2.5 text-xs transition-colors hover:border-amber-300 dark:hover:border-slate-700"
            >
              <div className="mt-0.5 p-1 rounded-md bg-amber-100 dark:bg-slate-900 border border-amber-300/60 dark:border-slate-700 shrink-0">
                {getIcon(log.actionType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-stone-800 dark:text-slate-200 leading-snug text-[11px] font-medium">{log.message}</p>
                <span className="text-[9px] text-stone-500 dark:text-slate-400 mt-0.5 block font-mono">
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
