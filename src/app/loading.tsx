import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
      <div className="w-16 h-16 relative flex items-center justify-center mb-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin absolute" />
        <span className="text-2xl select-none relative z-10">dY`</span>
      </div>
      <h2 className="text-lg font-title font-bold text-amber-500 animate-pulse">
        Consulting the Guild Archivist...
      </h2>
      <p className="text-xs text-muted-foreground mt-2 max-w-xs text-center">
        Gathering your quests, fetching your stats, and polishing your armor. Please wait warmly.
      </p>
    </div>
  );
}
