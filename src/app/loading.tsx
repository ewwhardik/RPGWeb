import { Scroll } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
      <div className="w-16 h-16 relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-600/40 flex items-center justify-center animate-pulse">
          <Scroll className="w-7 h-7 text-amber-600 dark:text-amber-400 animate-bounce" />
        </div>
      </div>
      <h2 className="text-lg font-title font-bold text-amber-950 dark:text-amber-300">
        Consulting the Guild Archivist...
      </h2>
      <p className="text-xs text-stone-600 dark:text-slate-400 mt-2 max-w-xs text-center leading-relaxed">
        Gathering your quests, fetching your stats, and polishing your armor. Please wait warmly.
      </p>
    </div>
  );
}
