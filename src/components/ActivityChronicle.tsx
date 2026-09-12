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
        return <Award className="w-3.5 h-3.5 text-amber-400" />;
      case "QUEST_COMPLETED":
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case "ITEM_PURCHASED":
        return <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />;
      case "WHEEL_OF_FATE":
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Scroll className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
    }
  }

  return (
    <div className="rpg-panel border border-slate-200 dark:border-slate-800 bg-card p-4">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3">
        <Scroll className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Guild Chronicle
        </h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center">
          The ink is still dry. Complete a quest to start your chronicle!
        </p>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded bg-background border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs"
            >
              <div className="mt-0.5 p-1 rounded bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
                {getIcon(log.actionType)}
              </div>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-200 leading-snug text-[11px]">{log.message}</p>
                <span className="text-[9px] text-slate-500">
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
