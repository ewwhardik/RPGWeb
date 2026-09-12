/**
 * Kingdom Weather Engine
 * Deterministic daily world weather based on date hash.
 * Every adventurer in the kingdom experiences synchronized climate effects.
 */

export interface KingdomWeather {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  accentBorder: string;
  bgGradient: string;
  effects: {
    mageSpellMultiplier?: number;
    negativeHabitPenaltyMultiplier?: number;
    morningGoldMultiplier?: number;
    streakXpMultiplier?: number;
    innRestBonusHp?: number;
    innRestBonusMp?: number;
  };
}

export const KINGDOM_WEATHER_CYCLES: KingdomWeather[] = [
  {
    id: "golden_dawn",
    name: "Golden Dawn",
    subtitle: "Auspicious Solar Alignment",
    description: "+50% Gold for all tasks completed before 12:00 PM. Early risers reap the harvest.",
    icon: "☀️",
    color: "#f59e0b",
    accentBorder: "border-amber-500/50",
    bgGradient: "from-amber-950/40 via-yellow-900/20 to-slate-950",
    effects: {
      morningGoldMultiplier: 1.5,
    },
  },
  {
    id: "tempest_of_resolve",
    name: "Tempest of Resolve",
    subtitle: "Charged Arcane Stormwinds",
    description: "Thunderous lightning empowers momentum. Daily streaks yield +25% bonus XP.",
    icon: "⚡",
    color: "#06b6d4",
    accentBorder: "border-cyan-500/50",
    bgGradient: "from-cyan-950/40 via-blue-900/20 to-slate-950",
    effects: {
      streakXpMultiplier: 1.25,
    },
  },
  {
    id: "solar_eclipse",
    name: "Solar Eclipse",
    subtitle: "Shadow Over the Citadel",
    description: "Mage spells deal +50% arcana power, but negative habit penalties sting +25% harsher.",
    icon: "🌘",
    color: "#a855f7",
    accentBorder: "border-purple-500/50",
    bgGradient: "from-purple-950/40 via-violet-900/20 to-slate-950",
    effects: {
      mageSpellMultiplier: 1.5,
      negativeHabitPenaltyMultiplier: 1.25,
    },
  },
  {
    id: "tavern_mists",
    name: "Tavern Mists",
    subtitle: "Calming Herbal Vapors",
    description: "Resting at the Inn regenerates an extra +10 HP and +15 MP. Perfect for recovery.",
    icon: "🌫️",
    color: "#10b981",
    accentBorder: "border-emerald-500/50",
    bgGradient: "from-emerald-950/40 via-teal-900/20 to-slate-950",
    effects: {
      innRestBonusHp: 10,
      innRestBonusMp: 15,
    },
  },
];

/**
 * Deterministically compute today's weather based on Gregorian date hash.
 */
export function getTodayKingdomWeather(targetDate?: Date): KingdomWeather {
  const date = targetDate || new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Deterministic seed: Cantor-like pairing of date components
  const seed = (year * 372 + month * 31 + day) % 2147483647;
  const index = Math.abs(seed) % KINGDOM_WEATHER_CYCLES.length;

  return KINGDOM_WEATHER_CYCLES[index];
}
